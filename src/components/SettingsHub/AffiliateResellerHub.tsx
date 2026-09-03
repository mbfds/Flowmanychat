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
  AlertCircle
} from 'lucide-react';
import { AffiliateAccount, AffiliateSale, AffiliatePayoutRequest, SubscriptionPlan } from '../../types';
import { plansAndAffiliatesService } from '../../services/plansAndAffiliatesService';
import { useAuth } from '../../context/AuthContext';

export const AffiliateResellerHub: React.FC = () => {
  const { user, tenant } = useAuth();
  const [affiliate, setAffiliate] = useState<AffiliateAccount | null>(null);
  const [sales, setSales] = useState<AffiliateSale[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Payout request modal & form
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(100);
  const [payoutMethod, setPayoutMethod] = useState<'pix' | 'bank_transfer'>('pix');
  const [payoutKey, setPayoutKey] = useState('');
  const [payoutHolder, setPayoutHolder] = useState(user?.name || '');
  const [payoutTaxId, setPayoutTaxId] = useState('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Reseller Simulator Modal
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simPlanId, setSimPlanId] = useState('plan_pro');
  const [simCustomerName, setSimCustomerName] = useState('Empresa Modelo Ltda');
  const [simCustomerEmail, setSimCustomerEmail] = useState('contato@empresamodelo.com.br');
  const [isSimulating, setIsSimulating] = useState(false);

  // Settings tab: 'dashboard' | 'sales' | 'payout_settings' | 'admin_approvals'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sales' | 'payout_settings' | 'admin_approvals'>('dashboard');
  const [adminPayouts, setAdminPayouts] = useState<AffiliatePayoutRequest[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUserId = user?.id || 'usr_admin_01';
      const currentTenantId = tenant?.id || 'tenant_main';
      
      const [affData, plansData] = await Promise.all([
        plansAndAffiliatesService.getMyAffiliateAccount(currentUserId, currentTenantId, user?.name, user?.email),
        plansAndAffiliatesService.getPlans()
      ]);

      setAffiliate(affData);
      setPlans(plansData);
      setPayoutKey(affData.payoutKey || user?.email || '');
      setPayoutHolder(affData.payoutHolderName || user?.name || '');

      const salesData = await plansAndAffiliatesService.getAffiliateSales(affData.id);
      setSales(salesData);
    } catch (err) {
      console.warn('Erro ao carregar afiliados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, tenant?.id]);

  const handleCopyLink = () => {
    if (!affiliate) return;
    navigator.clipboard.writeText(affiliate.affiliateLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!affiliate) return;
    navigator.clipboard.writeText(affiliate.affiliateCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSavePayoutSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliate) return;

    try {
      await plansAndAffiliatesService.updatePayoutSettings(affiliate.id, {
        payoutMethod,
        payoutKey,
        payoutHolderName: payoutHolder,
        payoutTaxId
      });
      setFeedback({ type: 'success', text: 'Dados de recebimento via Pix salvos com sucesso!' });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Erro ao salvar dados.' });
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliate) return;

    if (payoutAmount > (affiliate.availableForWithdrawal || 0)) {
      setFeedback({ type: 'error', text: 'Valor solicitado é maior que o saldo disponível para saque.' });
      setTimeout(() => setFeedback(null), 3500);
      return;
    }

    setIsSubmittingPayout(true);
    try {
      await plansAndAffiliatesService.requestPayout(
        affiliate.id,
        Number(payoutAmount),
        payoutMethod,
        payoutKey,
        payoutHolder,
        payoutTaxId
      );
      setFeedback({ type: 'success', text: `Solicitação de saque de R$ ${payoutAmount.toFixed(2)} enviada! O valor será transferido para sua chave Pix.` });
      setIsPayoutModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Erro ao solicitar saque.' });
    } finally {
      setIsSubmittingPayout(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleSimulateSale = async () => {
    if (!affiliate) return;
    setIsSimulating(true);

    try {
      const res = await plansAndAffiliatesService.simulateAffiliateSale(
        affiliate.id,
        simPlanId,
        simCustomerName,
        simCustomerEmail
      );
      if (res.success && res.sale) {
        setSales(prev => [res.sale!, ...prev]);
        setFeedback({ 
          type: 'success', 
          text: `🎉 Nova venda realizada! Comissão de R$ ${res.sale.commissionAmount.toFixed(2)} creditada instantaneamente!` 
        });
        setIsSimulatorOpen(false);
        await loadData();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: 'Erro ao simular venda.' });
    } finally {
      setIsSimulating(false);
      setTimeout(() => setFeedback(null), 4500);
    }
  };

  return (
    <div id="affiliate_reseller_hub" className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1A1D21]">Sistema de Afiliados & Revenda White-Label</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                Cada Cliente Vende Seu Sistema
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Ganhe de 30% a 40% de comissão recorrente todo mês sobre cada cliente que assinar o ManyFlow através da sua indicação ou link de revenda.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="py-2 px-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-emerald-600" />
            <span>Simular Nova Venda</span>
          </button>

          <button
            onClick={() => {
              setPayoutAmount(affiliate?.availableForWithdrawal || 100);
              setIsPayoutModalOpen(true);
            }}
            disabled={!affiliate || (affiliate.availableForWithdrawal || 0) <= 0}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            <span>Solicitar Saque Pix</span>
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

      {/* Referral Link & Code Box */}
      {affiliate && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Share2 className="w-3 h-3" />
              Seu Link Exclusivo de Afiliado & Revenda
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-slate-200 select-all truncate max-w-md">
                {affiliate.affiliateLink}
              </span>
              <button
                onClick={handleCopyLink}
                className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-5">
            <div>
              <span className="text-[10px] text-slate-400 block">Cupom / Código:</span>
              <span className="text-sm font-black font-mono text-emerald-400">{affiliate.affiliateCode}</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
              title="Copiar código"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <div className="pl-2 border-l border-white/10">
              <span className="text-[10px] text-slate-400 block">Comissão:</span>
              <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                {affiliate.commissionRate}% Mensal
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Disponível */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Disponível p/ Saque</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            R$ {(affiliate?.availableForWithdrawal || 0).toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 block">Transferência via Pix imediata</span>
        </div>

        {/* Card 2: Saldo Pendente */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Comissões Pendentes</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            R$ {(affiliate?.pendingBalance || 0).toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 block">Em processamento bancário</span>
        </div>

        {/* Card 3: Total Ganho */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Histórico Ganho</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            R$ {(affiliate?.totalEarnings || 0).toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 block">Comissões acumuladas</span>
        </div>

        {/* Card 4: Clientes Ativos */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Assinaturas Ativas</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 font-mono">
            {affiliate?.totalPaidClients || 0} <span className="text-xs font-normal text-slate-500">clientes</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            {affiliate?.conversionRatePercent || 0}% taxa de conversão
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Extrato de Comissões & Vendas
        </button>

        <button
          onClick={() => setActiveTab('payout_settings')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'payout_settings'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Configurar Chave Pix / Dados de Pagamento
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin_approvals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'admin_approvals'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin: Aprovação de Saques Pix</span>
          </button>
        )}
      </div>

      {/* Tab 1: Sales Table */}
      {activeTab === 'dashboard' && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Histórico de Vendas & Comissões ({sales.length})</span>
              </h4>
              <p className="text-[11px] text-[#64748B]">
                Comissões geradas pelos clientes que assinaram através do seu link de afiliado
              </p>
            </div>

            <button
              onClick={loadData}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Atualizar lista"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">Cliente / Empresa</th>
                  <th className="py-2.5 px-3">Pacote Assinado</th>
                  <th className="py-2.5 px-3">Valor da Venda</th>
                  <th className="py-2.5 px-3">Sua Comissão</th>
                  <th className="py-2.5 px-3">Recorrência</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Nenhuma venda registrada ainda. Use o botão "Simular Nova Venda" para testar o sistema!
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <div>{sale.customerName}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{sale.customerEmail}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                          {sale.planName}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        R$ {sale.saleAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                        + R$ {sale.commissionAmount.toFixed(2)}
                        <span className="text-[10px] text-slate-400 font-normal block">({sale.commissionRate}%)</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Mês {sale.isRecurrentMonth || 1}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sale.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sale.status === 'approved'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sale.status === 'paid' ? 'Pago no Pix' : sale.status === 'approved' ? 'Liberado p/ Saque' : 'Aguardando'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-500 font-mono">
                        {new Date(sale.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Payout Settings Form */}
      {activeTab === 'payout_settings' && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs max-w-2xl space-y-5">
          <div>
            <h4 className="text-sm font-bold text-[#1A1D21]">Configuração de Recebimento de Comissões</h4>
            <p className="text-xs text-[#64748B]">Informe sua chave Pix para receber os repasses das suas comissões de afiliado</p>
          </div>

          <form onSubmit={handleSavePayoutSettings} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Método de Pagamento</label>
              <select
                value={payoutMethod}
                onChange={(e: any) => setPayoutMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold"
              >
                <option value="pix">Pix (Transferência Instantânea)</option>
                <option value="bank_transfer">Transferência Bancária (TED)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Chave Pix *</label>
              <input
                type="text"
                required
                value={payoutKey}
                onChange={(e) => setPayoutKey(e.target.value)}
                placeholder="CPF, CNPJ, Email, Telefone ou Chave Aleatória"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome Completo do Titular *</label>
                <input
                  type="text"
                  required
                  value={payoutHolder}
                  onChange={(e) => setPayoutHolder(e.target.value)}
                  placeholder="Nome conforme documento"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">CPF / CNPJ do Titular</label>
                <input
                  type="text"
                  value={payoutTaxId}
                  onChange={(e) => setPayoutTaxId(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Dados de Recebimento</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Admin Approvals */}
      {activeTab === 'admin_approvals' && isAdmin && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Painel do Administrador: Liquidação de Comissões Pix</span>
              </h4>
              <p className="text-[11px] text-[#64748B]">Aprove e liquide solicitações de saque de afiliados com 1 clique</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
            <span className="font-bold">Regra de Pagamento de Afiliados:</span>
            <p className="text-[11px]">
              Os saques solicitados são processados via Pix para a chave cadastrada pelo parceiro. Ao clicar em Aprovar, o saldo é liquidado e deduzido do painel do afiliado.
            </p>
          </div>
        </div>
      )}

      {/* Modal: Request Payout */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1A1D21]">Solicitar Saque de Comissões</h4>
                  <p className="text-xs text-[#64748B]">Transferência direta via Pix</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleRequestPayout} className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <span className="text-xs text-emerald-800 font-semibold">Saldo Disponível:</span>
                <span className="text-base font-black text-emerald-800 font-mono">
                  R$ {(affiliate?.availableForWithdrawal || 0).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Valor do Saque (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="10"
                  max={affiliate?.availableForWithdrawal || 0}
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-black font-mono rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Chave Pix de Destino *</label>
                <input
                  type="text"
                  required
                  value={payoutKey}
                  onChange={(e) => setPayoutKey(e.target.value)}
                  placeholder="Chave Pix..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Titular da Conta Pix *</label>
                <input
                  type="text"
                  required
                  value={payoutHolder}
                  onChange={(e) => setPayoutHolder(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayout}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmittingPayout ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Confirmar Saque Pix</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Sales Simulator */}
      {isSimulatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1A1D21]">Simulador de Venda de Afiliado</h4>
                  <p className="text-xs text-[#64748B]">Simule um cliente comprando pelo seu link de revenda</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Selecione o Pacote Vendido</label>
                <select
                  value={simPlanId}
                  onChange={(e) => setSimPlanId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - R$ {p.priceMonthly}/mês (Comissão: {p.commissionRate || 30}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Cliente Comprador</label>
                <input
                  type="text"
                  value={simCustomerName}
                  onChange={(e) => setSimCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email do Cliente</label>
                <input
                  type="email"
                  value={simCustomerEmail}
                  onChange={(e) => setSimCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Efeito Imediato:
                </span>
                <p className="text-[11px] text-slate-600">
                  O sistema criará o registro de comissão no MongoDB/Memória, atualizará seu saldo disponível para saque e adicionará a recorrência mensal.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSimulatorOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handleSimulateSale}
                  disabled={isSimulating}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
                  <span>Executar Venda Simulada</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
