import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Share2, 
  Copy, 
  Check, 
  Wallet, 
  ArrowUpRight, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  Sliders, 
  Globe, 
  Building2, 
  Zap, 
  QrCode, 
  PlayCircle,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Plus,
  Trash2,
  Tag,
  Link as LinkIcon,
  Percent,
  Calculator,
  SlidersHorizontal,
  BarChart3,
  Search,
  Filter,
  Download,
  Award,
  ArrowDownToLine,
  CheckCheck
} from 'lucide-react';
import { 
  AffiliateAccount, 
  AffiliateSale, 
  AffiliatePayoutRequest, 
  SubscriptionPlan,
  AffiliateReferralLink,
  AffiliateCommissionRule
} from '../../types';
import { plansAndAffiliatesService } from '../../services/plansAndAffiliatesService';
import { useAuth } from '../../context/AuthContext';

export const AffiliateSystemModule: React.FC = () => {
  const { user, tenant } = useAuth();
  const [affiliate, setAffiliate] = useState<AffiliateAccount | null>(null);
  const [sales, setSales] = useState<AffiliateSale[]>([]);
  const [links, setLinks] = useState<AffiliateReferralLink[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [commissionRules, setCommissionRules] = useState<AffiliateCommissionRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active module tab
  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'commissions' | 'sales' | 'payouts' | 'admin'>('overview');

  // Copy states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedGeneral, setCopiedGeneral] = useState(false);

  // QR Code Modal
  const [selectedQrLink, setSelectedQrLink] = useState<string | null>(null);

  // Create Link Modal
  const [isCreateLinkOpen, setIsCreateLinkOpen] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkSlug, setNewLinkSlug] = useState('');
  const [newLinkDestination, setNewLinkDestination] = useState<'home' | 'plans' | 'checkout' | 'whatsapp_direct'>('home');
  const [newLinkCoupon, setNewLinkCoupon] = useState('');
  const [newLinkDiscount, setNewLinkDiscount] = useState<number>(10);
  const [newLinkSource, setNewLinkSource] = useState('instagram');
  const [newLinkCampaign, setNewLinkCampaign] = useState('reels_stories');
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);

  // Payout Modal & Settings
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(100);
  const [payoutMethod, setPayoutMethod] = useState<'pix' | 'bank_transfer'>('pix');
  const [payoutKeyType, setPayoutKeyType] = useState<'cpf' | 'cnpj' | 'email' | 'phone' | 'random'>('email');
  const [payoutKey, setPayoutKey] = useState('');
  const [payoutHolder, setPayoutHolder] = useState(user?.name || '');
  const [payoutTaxId, setPayoutTaxId] = useState('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [payoutHistory, setPayoutHistory] = useState<AffiliatePayoutRequest[]>([]);

  // Simulation & Calculator
  const [simPlanId, setSimPlanId] = useState('plan_pro');
  const [simClientsCount, setSimClientsCount] = useState<number>(15);
  const [simCustomerName, setSimCustomerName] = useState('Dra. Vanessa Lima (Clínica)');
  const [simCustomerEmail, setSimCustomerEmail] = useState('contato@clinicavanessa.com.br');
  const [isSimulatingSale, setIsSimulatingSale] = useState(false);

  // Admin approvals
  const [adminPayouts, setAdminPayouts] = useState<AffiliatePayoutRequest[]>([]);
  const [adminAffiliates, setAdminAffiliates] = useState<AffiliateAccount[]>([]);

  // Search & Filter
  const [salesSearch, setSalesSearch] = useState('');
  const [salesStatusFilter, setSalesStatusFilter] = useState<string>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUserId = user?.id || 'usr_admin_01';
      const currentTenantId = tenant?.id || 'tenant_main';

      const [affData, plansData, rulesData] = await Promise.all([
        plansAndAffiliatesService.getMyAffiliateAccount(currentUserId, currentTenantId, user?.name, user?.email),
        plansAndAffiliatesService.getPlans(),
        plansAndAffiliatesService.getCommissionRules()
      ]);

      setAffiliate(affData);
      setPlans(plansData);
      setCommissionRules(rulesData);
      setPayoutKey(affData.payoutKey || user?.email || '');
      setPayoutHolder(affData.payoutHolderName || user?.name || '');
      setPayoutTaxId(affData.payoutTaxId || '');

      const [salesData, linksData] = await Promise.all([
        plansAndAffiliatesService.getAffiliateSales(affData.id),
        plansAndAffiliatesService.getAffiliateLinks(affData.id)
      ]);

      setSales(salesData);
      setLinks(linksData);

      // If admin, load global payouts
      if (isAdmin) {
        try {
          const res = await fetch('/api/admin/affiliates');
          if (res.ok) {
            const data = await res.json();
            if (data.payoutRequests) setAdminPayouts(data.payoutRequests);
            if (data.affiliates) setAdminAffiliates(data.affiliates);
          }
        } catch {}
      }
    } catch (err) {
      console.warn('Erro ao carregar módulo de afiliados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, tenant?.id]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3800);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliate) return;

    if (!newLinkTitle.trim()) {
      showToast('error', 'Informe um título para a campanha.');
      return;
    }

    setIsSubmittingLink(true);
    try {
      const cleanSlug = (newLinkSlug || newLinkTitle).toLowerCase().replace(/[^a-z0-9]/g, '-');
      const baseUrl = `https://${window.location.host || 'app.manyflow.io'}`;
      let fullUrl = `${baseUrl}/?ref=${affiliate.affiliateCode}&camp=${cleanSlug}&src=${newLinkSource}`;
      if (newLinkCoupon) {
        fullUrl += `&cupom=${newLinkCoupon.toUpperCase()}`;
      }

      const res = await plansAndAffiliatesService.createAffiliateLink({
        affiliateId: affiliate.id,
        title: newLinkTitle.trim(),
        slug: cleanSlug,
        fullUrl,
        destinationPage: newLinkDestination,
        customCoupon: newLinkCoupon ? newLinkCoupon.toUpperCase() : undefined,
        discountPercent: newLinkDiscount,
        utmSource: newLinkSource,
        utmCampaign: newLinkCampaign
      });

      if (res.success && res.link) {
        setLinks(prev => [res.link!, ...prev]);
        showToast('success', 'Novo link de indicação gerado com sucesso!');
        setIsCreateLinkOpen(false);
        setNewLinkTitle('');
        setNewLinkSlug('');
        setNewLinkCoupon('');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao gerar link.');
    } finally {
      setIsSubmittingLink(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Deseja realmente desativar este link de indicação?')) return;
    try {
      await plansAndAffiliatesService.deleteAffiliateLink(linkId);
      setLinks(prev => prev.filter(l => l.id !== linkId));
      showToast('success', 'Link removido com sucesso!');
    } catch (err) {
      showToast('error', 'Erro ao remover link.');
    }
  };

  const handleSavePayoutDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliate) return;

    try {
      await plansAndAffiliatesService.updatePayoutSettings(affiliate.id, {
        payoutMethod,
        payoutKey,
        payoutHolderName: payoutHolder,
        payoutTaxId
      });
      showToast('success', 'Dados de recebimento Pix salvos com sucesso!');
      await loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao salvar dados Pix.');
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliate) return;

    if (payoutAmount > (affiliate.availableForWithdrawal || 0)) {
      showToast('error', 'O valor solicitado excede o saldo disponível para saque.');
      return;
    }

    if (payoutAmount < 50) {
      showToast('error', 'O valor mínimo para saque via Pix é R$ 50,00.');
      return;
    }

    setIsSubmittingPayout(true);
    try {
      const res = await plansAndAffiliatesService.requestPayout(
        affiliate.id,
        Number(payoutAmount),
        payoutMethod,
        payoutKey,
        payoutHolder,
        payoutTaxId
      );

      if (res.success) {
        showToast('success', `Solicitação de saque de R$ ${payoutAmount.toFixed(2)} enviada! O financeiro realizará a transferência Pix.`);
        setIsPayoutModalOpen(false);
        await loadData();
      }
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao solicitar saque.');
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const handleSimulateSale = async () => {
    if (!affiliate) return;
    setIsSimulatingSale(true);
    try {
      const res = await plansAndAffiliatesService.simulateAffiliateSale(
        affiliate.id,
        simPlanId,
        simCustomerName,
        simCustomerEmail
      );

      if (res.success && res.sale) {
        showToast('success', `Venda teste realizada! Comissão de R$ ${res.sale.commissionAmount.toFixed(2)} creditada.`);
        await loadData();
      }
    } catch (err: any) {
      showToast('error', 'Erro ao simular venda.');
    } finally {
      setIsSimulatingSale(false);
    }
  };

  const handleApprovePayout = async (payoutId: string) => {
    try {
      const res = await fetch(`/api/admin/affiliates/payouts/${payoutId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptUrl: `pix_comp_${Date.now()}` })
      });
      if (res.ok) {
        showToast('success', 'Saque liquidado via Pix com sucesso!');
        await loadData();
      }
    } catch (err) {
      showToast('error', 'Erro ao liquidar saque.');
    }
  };

  // Filter sales
  const filteredSales = sales.filter(s => {
    const matchSearch = 
      s.customerName.toLowerCase().includes(salesSearch.toLowerCase()) ||
      s.customerEmail.toLowerCase().includes(salesSearch.toLowerCase()) ||
      s.planName.toLowerCase().includes(salesSearch.toLowerCase());

    const matchStatus = salesStatusFilter === 'all' || s.status === salesStatusFilter;
    return matchSearch && matchStatus;
  });

  // Calculate MRR projection
  const selectedPlan = plans.find(p => p.id === simPlanId) || plans[1] || { priceMonthly: 197, commissionRate: 35 };
  const projectedMRR = simClientsCount * (selectedPlan.priceMonthly * ((selectedPlan.commissionRate || 30) / 100));

  return (
    <div id="affiliate-system-module-container" className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg animate-in slide-in-from-top-4 duration-200 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            <span className="text-xs font-bold">{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Hero Banner Header */}
      <div className="bg-gradient-to-r from-[#0084FF] via-[#0066CC] to-[#0A2540] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs border border-white/30 text-white text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SISTEMA DE AFILIADOS & PROGRAMA DE PARCEIROS</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Ganhe até 40% de Comissão Recorrente Todo Mês
            </h1>
            <p className="text-xs md:text-sm text-blue-100 leading-relaxed">
              Indique o ManyFlow para empresas, criadores de conteúdo e agências. Cada cliente que assinar através do seu link gera comissão automática todos os meses diretamente na sua chave Pix.
            </p>
          </div>

          {/* Direct Referral Code Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-5 flex flex-col gap-3 min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-blue-200 font-semibold uppercase">Seu Link Padrão</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-bold">
                Ativo • {affiliate?.commissionRate || 30}% Recorrente
              </span>
            </div>

            <div className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2 border border-white/10">
              <code className="text-xs font-mono font-bold text-white truncate flex-1">
                {affiliate?.affiliateLink || `https://app.manyflow.io/?ref=${affiliate?.affiliateCode || '...'}`}
              </code>
              <button
                onClick={() => {
                  if (affiliate) {
                    navigator.clipboard.writeText(affiliate.affiliateLink);
                    setCopiedGeneral(true);
                    setTimeout(() => setCopiedGeneral(false), 2000);
                  }
                }}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer shrink-0"
                title="Copiar Link"
              >
                {copiedGeneral ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setSelectedQrLink(affiliate?.affiliateLink || '')}
                className="flex-1 py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Ver QR Code</span>
              </button>
              <button
                onClick={() => setIsCreateLinkOpen(true)}
                className="flex-1 py-2 px-3 rounded-xl bg-white text-[#0066CC] hover:bg-blue-50 text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available for withdrawal */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Disponível p/ Saque</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-slate-900">
              R$ {(affiliate?.availableForWithdrawal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <span className="font-semibold text-emerald-600">Pix Imediato</span> • Sem taxa de transferência
            </p>
          </div>
          <button
            onClick={() => setIsPayoutModalOpen(true)}
            disabled={(affiliate?.availableForWithdrawal || 0) < 50}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Solicitar Saque Pix</span>
          </button>
        </div>

        {/* Pending commissions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Comissões a Receber</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-slate-900">
              R$ {(affiliate?.pendingBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500">
              Liberação em até 7 dias após confirmação
            </p>
          </div>
        </div>

        {/* Total earned lifetime */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Acumulado</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-slate-900">
              R$ {(affiliate?.totalEarnings || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500">
              {sales.length} vendas registradas
            </p>
          </div>
        </div>

        {/* Active subscribers & conversion */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conversão & Clientes</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-2">
              <span>{affiliate?.totalPaidClients || sales.length}</span>
              <span className="text-xs font-semibold text-slate-500">clientes ativos</span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span>{affiliate?.totalClicks || 120} cliques</span>
              <span>•</span>
              <span className="font-semibold text-indigo-600">Taxa {affiliate?.conversionRatePercent || 20.5}%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#0084FF] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Visão Geral & Simulador</span>
        </button>

        <button
          onClick={() => setActiveTab('links')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'links'
              ? 'bg-[#0084FF] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Gerenciador de Links ({links.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'commissions'
              ? 'bg-[#0084FF] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          <span>Regras de Comissão por Plano</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'sales'
              ? 'bg-[#0084FF] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Extrato de Vendas ({sales.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'payouts'
              ? 'bg-[#0084FF] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Configuração de Saque Pix</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Gestão de Liquidações Pix ({adminPayouts.filter(p => p.status === 'pending').length})</span>
          </button>
        )}
      </div>

      {/* TAB 1: Overview & Interactive Revenue Calculator */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive MRR Projection Calculator */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-7 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">Simulador de Faturamento Recorrente (MRR)</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Estime seus ganhos mensais acumulados ao indicar novos clientes para cada pacote do ManyFlow.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  Comissão Recorrente Mês a Mês
                </span>
              </div>

              {/* Sliders and inputs */}
              <div className="space-y-5 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-700">Selecione o Plano Indicado:</label>
                    <span className="text-xs font-bold text-blue-600">
                      R$ {selectedPlan.priceMonthly.toFixed(2)}/mês ({selectedPlan.commissionRate || 30}% de comissão)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {plans.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSimPlanId(p.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          simPlanId === p.id 
                            ? 'bg-white border-blue-600 shadow-sm ring-2 ring-blue-500/20' 
                            : 'bg-white/60 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <span className="block text-xs font-bold text-slate-900 truncate">{p.name}</span>
                        <span className="block text-[11px] text-slate-500 font-mono">R$ {p.priceMonthly}/mês</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-700">Quantidade de Clientes Ativos Indicados:</label>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">{simClientsCount} clientes</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={simClientsCount}
                    onChange={(e) => setSimClientsCount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>1 cliente</span>
                    <span>25 clientes</span>
                    <span>50 clientes</span>
                    <span>100 clientes</span>
                  </div>
                </div>
              </div>

              {/* Calculation Result */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider block">
                    Renda Mensal Recorrente Estimada (MRR)
                  </span>
                  <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                    R$ {projectedMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span className="text-xs text-slate-300 font-sans font-normal">/ mês</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Projeção anual: <strong className="text-white">R$ {(projectedMRR * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> em comissões líquidas.
                  </p>
                </div>

                <button
                  onClick={() => setIsCreateLinkOpen(true)}
                  className="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Começar a Divulgar Agora</span>
                </button>
              </div>
            </div>

            {/* Sandbox Simulator for Test Conversions */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">Sandbox de Teste de Venda</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Simule uma conversão de teste para ver a comissão creditada em tempo real no seu extrato e saldo de saque.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nome do Cliente Teste:</label>
                    <input
                      type="text"
                      value={simCustomerName}
                      onChange={(e) => setSimCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Email:</label>
                    <input
                      type="email"
                      value={simCustomerEmail}
                      onChange={(e) => setSimCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Plano Adquirido:</label>
                    <select
                      value={simPlanId}
                      onChange={(e) => setSimPlanId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 outline-hidden"
                    >
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (R$ {p.priceMonthly}/mês • {p.commissionRate || 30}% comissão)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSimulateSale}
                disabled={isSimulatingSale}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSimulatingSale ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-400" />}
                <span>Disparar Venda de Teste</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Custom Referral Links Manager */}
      {activeTab === 'links' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-600" />
                Seus Links de Indicação Personalizados
              </h3>
              <p className="text-xs text-slate-500">
                Crie múltiplos links com parâmetros UTM, cupons de desconto e páginas de destino customizadas para cada canal de divulgação.
              </p>
            </div>

            <button
              onClick={() => setIsCreateLinkOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Link de Campanha</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links.map((link) => (
              <div key={link.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{link.title}</h4>
                      {link.customCoupon && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-mono text-[10px] font-bold flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {link.customCoupon} (-{link.discountPercent}%)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Destino: <strong>{link.destinationPage === 'home' ? 'Página Inicial' : link.destinationPage === 'plans' ? 'Tabela de Planos' : 'Checkout Direto'}</strong>
                      {link.utmSource && ` • Canal: ${link.utmSource}`}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                    title="Remover Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Link URL Bar */}
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                  <code className="text-xs font-mono text-slate-800 truncate flex-1">{link.fullUrl}</code>
                  <button
                    onClick={() => handleCopy(link.fullUrl, link.id)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer shrink-0"
                    title="Copiar URL"
                  >
                    {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Link Performance Metrics */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Cliques</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">{link.clicks || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Leads</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">{link.leads || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Vendas</span>
                    <span className="text-xs font-bold text-emerald-700 font-mono">{link.conversions || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Ganhos</span>
                    <span className="text-xs font-bold text-blue-700 font-mono">R$ {link.totalEarned || 0}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedQrLink(link.fullUrl)}
                    className="flex-1 py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-slate-500" />
                    <span>Gerar QR Code</span>
                  </button>
                  <a
                    href={link.fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    <span>Testar Destino</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Commission Rules by Plan */}
      {activeTab === 'commissions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Percent className="w-5 h-5 text-blue-600" />
                Tabela de Comissionamento Recorrente por Pacote
              </h3>
              <p className="text-xs text-slate-500">
                Entenda quanto você recebe por cada cliente ativo na sua carteira de indicações.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {plans.map((plan) => {
                const commRate = plan.commissionRate || (plan.id === 'plan_whitelabel' ? 40 : plan.id === 'plan_pro' ? 35 : 30);
                const commMonthly = (plan.priceMonthly * commRate) / 100;
                const commYearly = (plan.priceYearly * commRate) / 100;

                return (
                  <div key={plan.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 relative overflow-hidden">
                    {plan.isHighlighted && (
                      <span className="absolute right-4 top-4 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                        Mais Popular
                      </span>
                    )}

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">{plan.name}</h4>
                      <div className="text-xl font-extrabold text-slate-900">
                        R$ {plan.priceMonthly.toFixed(2)} <span className="text-xs text-slate-500 font-normal">/ mês</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 font-semibold">Sua Comissão (%):</span>
                        <span className="text-sm font-extrabold text-emerald-600 font-mono">{commRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 font-semibold">Ganho Mensal por Cliente:</span>
                        <span className="text-xs font-bold text-slate-900 font-mono">R$ {commMonthly.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 font-semibold">Ganho Anual por Cliente:</span>
                        <span className="text-xs font-bold text-slate-900 font-mono">R$ {commYearly.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Comissão mensal vitalícia</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Crédito automático no dashboard</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Sales Statement & Conversions */}
      {activeTab === 'sales' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Extrato Completo de Vendas e Conversões
                </h3>
                <p className="text-xs text-slate-500">
                  Acompanhe todas as mensalidades pagas pelos clientes indicados pelo seu link.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={salesSearch}
                    onChange={(e) => setSalesSearch(e.target.value)}
                    placeholder="Buscar cliente ou plano..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-hidden"
                  />
                </div>

                <select
                  value={salesStatusFilter}
                  onChange={(e) => setSalesStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-hidden font-semibold"
                >
                  <option value="all">Todos os Status</option>
                  <option value="approved">Aprovados</option>
                  <option value="paid">Pagos</option>
                  <option value="pending">Pendentes</option>
                </select>
              </div>
            </div>

            {/* Sales Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Cliente / Empresa</th>
                    <th className="p-3.5">Plano Contratado</th>
                    <th className="p-3.5">Valor da Mensalidade</th>
                    <th className="p-3.5">Sua Comissão</th>
                    <th className="p-3.5">Recorrência</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Nenhuma venda encontrada com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 block">{sale.customerName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{sale.customerEmail}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-800">
                          {sale.planName}
                        </td>
                        <td className="p-3.5 font-mono text-slate-700">
                          R$ {sale.saleAmount.toFixed(2)}
                        </td>
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-emerald-600 block">
                            + R$ {sale.commissionAmount.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{sale.commissionRate}% rate</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                            Mês {sale.isRecurrentMonth || 1}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            sale.status === 'paid' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : sale.status === 'approved'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {sale.status === 'paid' ? 'Pago' : sale.status === 'approved' ? 'Aprovado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                          {new Date(sale.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Payout Settings & Pix Withdrawal */}
      {activeTab === 'payouts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payout Settings Form */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-blue-600" />
                  Dados Bancários para Recebimento via Pix
                </h3>
                <p className="text-xs text-slate-500">
                  Mantenha sua chave Pix atualizada para que as transferências de comissão sejam processadas sem atrasos.
                </p>
              </div>

              <form onSubmit={handleSavePayoutDetails} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Tipo de Chave Pix</label>
                  <select
                    value={payoutKeyType}
                    onChange={(e: any) => setPayoutKeyType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-hidden font-semibold"
                  >
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="email">Email</option>
                    <option value="phone">Telefone (Celular)</option>
                    <option value="random">Chave Aleatória (EVP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Chave Pix</label>
                  <input
                    type="text"
                    required
                    value={payoutKey}
                    onChange={(e) => setPayoutKey(e.target.value)}
                    placeholder="Ex: seu-email@banco.com ou 123.456.789-00"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Nome Completo do Titular</label>
                  <input
                    type="text"
                    required
                    value={payoutHolder}
                    onChange={(e) => setPayoutHolder(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">CPF ou CNPJ do Titular</label>
                  <input
                    type="text"
                    value={payoutTaxId}
                    onChange={(e) => setPayoutTaxId(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono text-slate-800 outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Dados de Recebimento Pix</span>
                </button>
              </form>
            </div>

            {/* Quick Withdrawal Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Liquidação Segura via Pix</span>
                </div>
                <h3 className="text-xl font-bold">Solicitar Transferência de Saldo</h3>
                <p className="text-xs text-slate-300">
                  O valor é transferido para a chave Pix cadastrada em até 24 horas úteis.
                </p>

                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold block">Saldo Disponível Atual</span>
                  <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                    R$ {(affiliate?.availableForWithdrawal || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsPayoutModalOpen(true)}
                disabled={(affiliate?.availableForWithdrawal || 0) < 50}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Solicitar Saque Imediato</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Admin Approvals & Payout Management */}
      {isAdmin && activeTab === 'admin' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 border border-purple-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  Painel de Aprovação e Liquidação de Saques (Admin Master)
                </h3>
                <p className="text-xs text-slate-500">
                  Revise as solicitações de saque dos afiliados parceiros e marque como liquidado após a transferência Pix.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                {adminPayouts.filter(p => p.status === 'pending').length} pendente(s)
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Afiliado</th>
                    <th className="p-3.5">Valor Solicitado</th>
                    <th className="p-3.5">Chave Pix</th>
                    <th className="p-3.5">Titular / CPF</th>
                    <th className="p-3.5">Data da Solicitação</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Nenhuma solicitação de saque registrada no momento.
                      </td>
                    </tr>
                  ) : (
                    adminPayouts.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/60">
                        <td className="p-3.5 font-bold text-slate-900">{req.affiliateName || 'Afiliado'}</td>
                        <td className="p-3.5 font-mono font-extrabold text-slate-900">
                          R$ {req.amount.toFixed(2)}
                        </td>
                        <td className="p-3.5 font-mono text-xs text-blue-700 font-bold">{req.payoutKey}</td>
                        <td className="p-3.5 text-slate-600">{req.payoutHolderName} ({req.payoutTaxId || 'CPF'})</td>
                        <td className="p-3.5 font-mono text-slate-500">{new Date(req.requestedAt).toLocaleDateString('pt-BR')}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'completed' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {req.status === 'completed' ? 'Liquidado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {req.status === 'pending' && (
                            <button
                              onClick={() => handleApprovePayout(req.id)}
                              className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                            >
                              Aprovar & Liquidar Pix
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Custom Referral Link */}
      {isCreateLinkOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Gerar Novo Link de Indicação</h3>
              </div>
              <button
                onClick={() => setIsCreateLinkOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Título da Campanha</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bio do Instagram, Canal do YouTube, Tráfego Pago"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-slate-800 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Canal (UTM Source)</label>
                  <select
                    value={newLinkSource}
                    onChange={(e) => setNewLinkSource(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-slate-800 outline-hidden"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="tiktok">TikTok</option>
                    <option value="google_ads">Google Ads</option>
                    <option value="meta_ads">Meta Ads</option>
                    <option value="direct">Indicação Direta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Página de Destino</label>
                  <select
                    value={newLinkDestination}
                    onChange={(e: any) => setNewLinkDestination(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-slate-800 outline-hidden"
                  >
                    <option value="home">Página Inicial (Landing)</option>
                    <option value="plans">Tabela de Planos</option>
                    <option value="checkout">Checkout Direto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Cupom de Desconto (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: DESCONTO10"
                    value={newLinkCoupon}
                    onChange={(e) => setNewLinkCoupon(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white font-mono text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Desconto no Cupom (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={newLinkDiscount}
                    onChange={(e) => setNewLinkDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateLinkOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLink}
                  className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmittingLink ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Salvar Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request Payout */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Solicitar Saque via Pix</h3>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                <span className="text-xs font-semibold text-emerald-900">Saldo Disponível:</span>
                <span className="text-base font-extrabold text-emerald-700 font-mono">
                  R$ {(affiliate?.availableForWithdrawal || 0).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Valor do Saque (R$)</label>
                <input
                  type="number"
                  min="50"
                  max={affiliate?.availableForWithdrawal || 0}
                  step="0.01"
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white font-mono text-slate-800 font-bold outline-hidden"
                />
                <span className="text-[10px] text-slate-400">Valor mínimo: R$ 50,00</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Chave Pix de Destino</label>
                <input
                  type="text"
                  required
                  value={payoutKey}
                  onChange={(e) => setPayoutKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white font-mono text-slate-800 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Titular</label>
                <input
                  type="text"
                  required
                  value={payoutHolder}
                  onChange={(e) => setPayoutHolder(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white text-slate-800 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayout}
                  className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmittingPayout ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Confirmar Saque Pix</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: QR Code Preview */}
      {selectedQrLink && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">QR Code de Indicação</h4>
              <button onClick={() => setSelectedQrLink(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedQrLink)}`}
                alt="QR Code"
                className="w-48 h-48 rounded-xl shadow-xs"
                referrerPolicy="no-referrer"
              />
            </div>

            <p className="text-xs text-slate-500 font-mono break-all text-center">
              {selectedQrLink}
            </p>

            <button
              onClick={() => setSelectedQrLink(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
