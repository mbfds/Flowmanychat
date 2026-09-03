import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  Download, 
  Send, 
  Copy, 
  Check, 
  QrCode, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  MessageSquare, 
  User, 
  Building2, 
  Sparkles, 
  ChevronRight, 
  CalendarPlus, 
  ShieldCheck,
  X,
  Phone,
  FileText,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { 
  CustomerSubscription, 
  SubscriptionPaymentStatus, 
  SubscriptionPaymentMethod,
  SubscriptionPlan
} from '../../types';
import { adminManagementService } from '../../services/adminManagementService';
import { plansAndAffiliatesService } from '../../services/plansAndAffiliatesService';

export const AdminSubscriptionsManager: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Modal State for New / Edit Subscription
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<CustomerSubscription | null>(null);
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    tenantName: '',
    planId: 'plan_pro',
    planName: 'Profissional (Growth)',
    amount: 197.00,
    billingCycle: 'monthly' as 'monthly' | 'yearly',
    paymentMethod: 'pix' as SubscriptionPaymentMethod,
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // PIX View Modal
  const [selectedPixSub, setSelectedPixSub] = useState<CustomerSubscription | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // WhatsApp Reminder Modal
  const [reminderSub, setReminderSub] = useState<CustomerSubscription | null>(null);
  const [customReminderMsg, setCustomReminderMsg] = useState('');
  const [copiedMsg, setCopiedMsg] = useState(false);

  // General Notification feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subsData, plansData] = await Promise.all([
        adminManagementService.getSubscriptions(),
        plansAndAffiliatesService.getPlans()
      ]);
      setSubscriptions(subsData);
      setPlans(plansData);
    } catch (err) {
      console.warn('Erro ao carregar mensalidades:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingSub(null);
    const in5Days = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];
    setFormData({
      userName: '',
      userEmail: '',
      userPhone: '+55 11 9',
      tenantName: '',
      planId: plans[1]?.id || 'plan_pro',
      planName: plans[1]?.name || 'Profissional (Growth)',
      amount: plans[1]?.priceMonthly || 197.00,
      billingCycle: 'monthly',
      paymentMethod: 'pix',
      dueDate: in5Days,
      notes: 'Mensalidade gerada manualmente para ativação de cliente.'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sub: CustomerSubscription) => {
    setEditingSub(sub);
    setFormData({
      userName: sub.userName,
      userEmail: sub.userEmail,
      userPhone: sub.userPhone || '',
      tenantName: sub.tenantName,
      planId: sub.planId,
      planName: sub.planName,
      amount: sub.amount,
      billingCycle: sub.billingCycle,
      paymentMethod: sub.paymentMethod,
      dueDate: sub.dueDate,
      notes: sub.notes || ''
    });
    setIsModalOpen(true);
  };

  const handlePlanSelectChange = (planId: string) => {
    const selected = plans.find(p => p.id === planId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        planId: selected.id,
        planName: selected.name,
        amount: prev.billingCycle === 'yearly' ? selected.priceYearly : selected.priceMonthly
      }));
    }
  };

  const handleCycleChange = (cycle: 'monthly' | 'yearly') => {
    const selected = plans.find(p => p.id === formData.planId);
    setFormData(prev => ({
      ...prev,
      billingCycle: cycle,
      amount: selected ? (cycle === 'yearly' ? selected.priceYearly : selected.priceMonthly) : prev.amount
    }));
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingSub) {
        const res = await adminManagementService.updateSubscription(editingSub.id, {
          userName: formData.userName,
          userEmail: formData.userEmail,
          userPhone: formData.userPhone,
          tenantName: formData.tenantName,
          planId: formData.planId,
          planName: formData.planName,
          amount: Number(formData.amount),
          billingCycle: formData.billingCycle,
          paymentMethod: formData.paymentMethod,
          dueDate: formData.dueDate,
          notes: formData.notes
        });

        if (res.success && res.subscription) {
          setSubscriptions(prev => prev.map(s => s.id === editingSub.id ? res.subscription! : s));
          setFeedback({ type: 'success', message: `Mensalidade de ${formData.userName} atualizada!` });
          setIsModalOpen(false);
        }
      } else {
        const res = await adminManagementService.createSubscription({
          userName: formData.userName,
          userEmail: formData.userEmail,
          userPhone: formData.userPhone,
          tenantName: formData.tenantName,
          planId: formData.planId,
          planName: formData.planName,
          amount: Number(formData.amount),
          billingCycle: formData.billingCycle,
          paymentMethod: formData.paymentMethod,
          dueDate: formData.dueDate,
          notes: formData.notes
        });

        if (res.success && res.subscription) {
          setSubscriptions(prev => [res.subscription!, ...prev]);
          setFeedback({ type: 'success', message: `Nova mensalidade cadastrada para ${formData.userName}!` });
          setIsModalOpen(false);
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao salvar mensalidade' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleConfirmPaid = async (sub: CustomerSubscription) => {
    if (!confirm(`Confirmar recebimento manual de R$ ${sub.amount.toFixed(2)} para ${sub.userName}? O status passará para "Pago" e a data de renovação será avançada.`)) {
      return;
    }

    const res = await adminManagementService.markAsPaid(sub.id);
    if (res.success && res.subscription) {
      setSubscriptions(prev => prev.map(s => s.id === sub.id ? res.subscription! : s));
      setFeedback({ 
        type: 'success', 
        message: `Pagamento da fatura de R$ ${sub.amount.toFixed(2)} confirmado com sucesso para ${sub.userName}!` 
      });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleExtendDueDate = async (sub: CustomerSubscription, days: number = 30) => {
    const res = await adminManagementService.extendDueDate(sub.id, days);
    if (res.success) {
      setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...s, dueDate: res.newDueDate, status: s.status === 'overdue' ? 'pending' : s.status } : s));
      setFeedback({ 
        type: 'success', 
        message: `Vencimento de ${sub.userName} prorrogado em +${days} dias (Novo vencimento: ${new Date(res.newDueDate).toLocaleDateString('pt-BR')}).` 
      });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleDeleteSub = async (sub: CustomerSubscription) => {
    if (!confirm(`Deseja realmente remover a cobrança de ${sub.userName} (R$ ${sub.amount.toFixed(2)})?`)) {
      return;
    }

    const res = await adminManagementService.deleteSubscription(sub.id);
    if (res.success) {
      setSubscriptions(prev => prev.filter(s => s.id !== sub.id));
      setFeedback({ type: 'success', message: 'Fatura excluída com sucesso.' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const openReminderModal = (sub: CustomerSubscription) => {
    const dueDateFormatted = new Date(sub.dueDate).toLocaleDateString('pt-BR');
    const msg = `Olá, *${sub.userName.split(' ')[0]}*! Tudo bem?\n\nPassando para lembrar que sua mensalidade da plataforma ManyFlow (${sub.planName}) vence em *${dueDateFormatted}* no valor de *R$ ${sub.amount.toFixed(2)}*.\n\n🔑 *Chave PIX Copia-e-Cola:*\n${sub.pixCopyPasteCode || 'admin@manyflow.io'}\n\nAssim que efetuar o pagamento, basta nos avisar por aqui para compensação automática. Muito obrigado por estar conosco! 🚀`;

    setReminderSub(sub);
    setCustomReminderMsg(msg);
    setCopiedMsg(false);
  };

  const handleSendReminder = async () => {
    if (!reminderSub) return;
    await adminManagementService.sendPaymentReminder(reminderSub.id);
    setSubscriptions(prev => prev.map(s => s.id === reminderSub.id ? { ...s, remindersSent: (s.remindersSent || 0) + 1, lastReminderAt: new Date().toISOString() } : s));

    // Open WhatsApp Web with pre-filled message if phone exists
    const cleanPhone = reminderSub.userPhone?.replace(/\D/g, '') || '';
    if (cleanPhone) {
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customReminderMsg)}`;
      window.open(waUrl, '_blank');
    }

    setFeedback({ type: 'success', message: `Lembrete enviado e registrado no histórico de ${reminderSub.userName}!` });
    setReminderSub(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Cliente', 'Email', 'Telefone', 'Workspace', 'Plano', 'Valor (R$)', 'Ciclo', 'Status', 'Metodo', 'Vencimento', 'Proxima_Renovacao'];
    const rows = filteredSubscriptions.map(s => [
      s.id,
      `"${s.userName}"`,
      s.userEmail,
      s.userPhone || '',
      `"${s.tenantName}"`,
      `"${s.planName}"`,
      s.amount.toFixed(2),
      s.billingCycle,
      s.status,
      s.paymentMethod,
      s.dueDate,
      s.nextBillingDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `manyflow-mensalidades-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations for Financial KPIs
  const mrrTotal = subscriptions
    .filter(s => s.status !== 'cancelled')
    .reduce((acc, s) => acc + (s.billingCycle === 'yearly' ? s.amount / 12 : s.amount), 0);

  const totalPaidThisMonth = subscriptions
    .filter(s => s.status === 'paid')
    .reduce((acc, s) => acc + s.amount, 0);

  const totalPendingAmount = subscriptions
    .filter(s => s.status === 'pending')
    .reduce((acc, s) => acc + s.amount, 0);

  const totalOverdueAmount = subscriptions
    .filter(s => s.status === 'overdue')
    .reduce((acc, s) => acc + s.amount, 0);

  const activeSubscribersCount = subscriptions.filter(s => s.status === 'paid').length;

  // Filtered subscriptions list
  const filteredSubscriptions = subscriptions.filter(s => {
    const matchesSearch = 
      s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || s.paymentMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const renderStatusBadge = (status: SubscriptionPaymentStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pago
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pendente
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Atrasado
          </span>
        );
      case 'cancelled':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <XCircle className="w-3.5 h-3.5 text-gray-500" /> Cancelado
          </span>
        );
    }
  };

  const renderMethodBadge = (method: SubscriptionPaymentMethod) => {
    switch (method) {
      case 'pix':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <QrCode className="w-3 h-3 text-emerald-600" /> PIX Instantâneo
          </span>
        );
      case 'credit_card':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <CreditCard className="w-3 h-3 text-blue-600" /> Cartão de Crédito
          </span>
        );
      case 'bank_slip':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            <FileText className="w-3 h-3 text-purple-600" /> Boleto Bancário
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F9FB] overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Gestão de Mensalidades & Faturas</h1>
                <p className="text-xs text-gray-500">Administre o faturamento recorrente, confirmações de PIX e controle de vencimentos</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
              title="Exportar faturas em CSV"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" /> Exportar CSV
            </button>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
              title="Recarregar"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Nova Mensalidade / Cobrança
            </button>
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
        {/* Financial KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-blue-200/80 shadow-xs flex flex-col justify-between bg-gradient-to-b from-white to-blue-50/20">
            <span className="text-xs font-medium text-blue-700">MRR (Recorrência Mensal)</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-blue-950">R$ {mrrTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-[11px] text-blue-600 mt-1">{activeSubscribersCount} assinantes ativos</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-200/80 shadow-xs flex flex-col justify-between bg-gradient-to-b from-white to-emerald-50/20">
            <span className="text-xs font-medium text-emerald-700">Recebido no Mês</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-emerald-950">R$ {totalPaidThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-[11px] text-emerald-600 mt-1">Faturas liquidadas com sucesso</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-amber-200/80 shadow-xs flex flex-col justify-between bg-gradient-to-b from-white to-amber-50/20">
            <span className="text-xs font-medium text-amber-700">Aguardando Pagamento</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-amber-950">R$ {totalPendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-[11px] text-amber-600 mt-1">PIX e boletos em aberto</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-red-200/80 shadow-xs flex flex-col justify-between bg-gradient-to-b from-white to-red-50/20">
            <span className="text-xs font-medium text-red-700">Inadimplência (Atrasados)</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-red-950">R$ {totalOverdueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-[11px] text-red-600 mt-1">Requer envio de lembrete</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-medium text-gray-500">Ticket Médio</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-gray-900">
                R$ {subscriptions.length > 0 ? (mrrTotal / (subscriptions.length || 1)).toFixed(2) : '0.00'}
              </span>
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-[11px] text-gray-500 mt-1">Por workspace ativo</span>
          </div>
        </div>

        {/* Filters & Actions Bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative min-w-[260px] flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, email, workspace ou código..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">Todos os Status</option>
                <option value="paid">Pagos</option>
                <option value="pending">Pendentes</option>
                <option value="overdue">Atrasados</option>
                <option value="cancelled">Cancelados</option>
              </select>

              {/* Method Filter */}
              <select
                value={methodFilter}
                onChange={e => setMethodFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">Todas as Formas</option>
                <option value="pix">PIX</option>
                <option value="credit_card">Cartão</option>
                <option value="bank_slip">Boleto</option>
              </select>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">Cliente / Workspace</th>
                  <th className="px-5 py-3.5">Plano Contratado</th>
                  <th className="px-5 py-3.5">Valor Mensalidade</th>
                  <th className="px-5 py-3.5">Método</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Vencimento</th>
                  <th className="px-5 py-3.5 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                      <Receipt className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="font-medium text-gray-700">Nenhuma mensalidade encontrada</p>
                      <p className="text-xs text-gray-400 mt-1">Crie uma nova cobrança ou ajuste os filtros acima</p>
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Customer Info */}
                      <td className="px-5 py-3.5">
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            {sub.userName}
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-gray-400" />
                            {sub.tenantName}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {sub.userEmail} {sub.userPhone && `• ${sub.userPhone}`}
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-gray-800">{sub.planName}</span>
                        <div className="text-[10px] text-gray-400 capitalize">Ciclo: {sub.billingCycle === 'yearly' ? 'Anual' : 'Mensal'}</div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-gray-900 text-sm">
                          R$ {sub.amount.toFixed(2)}
                        </span>
                      </td>

                      {/* Method */}
                      <td className="px-5 py-3.5">
                        {renderMethodBadge(sub.paymentMethod)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        {renderStatusBadge(sub.status)}
                      </td>

                      {/* Due Date & Next Billing */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 font-medium text-gray-900">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(sub.dueDate).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Próx. Renovação: {new Date(sub.nextBillingDate).toLocaleDateString('pt-BR')}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Confirm Payment Manual Button */}
                          {sub.status !== 'paid' && (
                            <button
                              onClick={() => handleConfirmPaid(sub)}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-all flex items-center gap-1"
                              title="Confirmar recebimento do pagamento"
                            >
                              <Check className="w-3.5 h-3.5" /> Baixar
                            </button>
                          )}

                          {/* PIX Modal view */}
                          <button
                            onClick={() => {
                              setSelectedPixSub(sub);
                              setCopiedPix(false);
                            }}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Ver Código PIX / QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {/* Send WhatsApp Reminder */}
                          <button
                            onClick={() => openReminderModal(sub)}
                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Enviar aviso de cobrança no WhatsApp"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          {/* Extend Due Date */}
                          <button
                            onClick={() => handleExtendDueDate(sub, 30)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Prorrogar vencimento (+30 dias)"
                          >
                            <CalendarPlus className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(sub)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Editar mensalidade"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteSub(sub)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Excluir fatura"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: New / Edit Subscription */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  {editingSub ? 'Editar Mensalidade' : 'Emitir Nova Mensalidade / Cobrança'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubscription} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nome do Cliente / Empresa</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dra. Juliana Costa"
                    value={formData.userName}
                    onChange={e => setFormData({ ...formData, userName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nome do Workspace</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Clínica Juliana Estética"
                    value={formData.tenantName}
                    onChange={e => setFormData({ ...formData, tenantName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">E-mail para Cobrança</label>
                  <input
                    type="email"
                    required
                    placeholder="juliana@clinica.com.br"
                    value={formData.userEmail}
                    onChange={e => setFormData({ ...formData, userEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp (com DDD)</label>
                  <input
                    type="text"
                    placeholder="+55 11 98888-7777"
                    value={formData.userPhone}
                    onChange={e => setFormData({ ...formData, userPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Plano de Assinatura</label>
                  <select
                    value={formData.planId}
                    onChange={e => handlePlanSelectChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (R$ {p.priceMonthly}/mês)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ciclo de Faturamento</label>
                  <select
                    value={formData.billingCycle}
                    onChange={e => handleCycleChange(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="monthly">Mensalidade (Cobrança Recorrente Mensal)</option>
                    <option value="yearly">Anuidade (Cobrança Anual com Desconto)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Valor da Mensalidade (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="pix">PIX Instantâneo</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="bank_slip">Boleto Bancário</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Observações Internas</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Contrato assinado por WhatsApp, 1ª mensalidade bonificada..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
                >
                  {isSaving ? 'Salvando...' : editingSub ? 'Salvar Alterações' : 'Salvar e Emitir Fatura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View PIX & QR Code */}
      {selectedPixSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-gray-900">Cobrança PIX • {selectedPixSub.userName}</h3>
              </div>
              <button onClick={() => setSelectedPixSub(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="inline-block p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
                {/* SVG Visual QR Code placeholder */}
                <div className="w-40 h-40 bg-gray-900 rounded-lg p-2 flex flex-col justify-between mx-auto">
                  <div className="flex justify-between">
                    <div className="w-8 h-8 bg-white rounded-xs p-1"><div className="w-full h-full bg-black rounded-xs" /></div>
                    <div className="w-8 h-8 bg-white rounded-xs p-1"><div className="w-full h-full bg-black rounded-xs" /></div>
                  </div>
                  <div className="text-[10px] text-white font-mono tracking-widest text-center">PIX • MANYFLOW</div>
                  <div className="flex justify-between">
                    <div className="w-8 h-8 bg-white rounded-xs p-1"><div className="w-full h-full bg-black rounded-xs" /></div>
                    <div className="w-8 h-8 bg-white rounded-xs flex items-center justify-center text-[9px] font-bold text-black">R$</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-lg font-bold text-gray-900">
                  R$ {selectedPixSub.amount.toFixed(2)}
                </div>
                <p className="text-xs text-gray-500">
                  Vencimento: {new Date(selectedPixSub.dueDate).toLocaleDateString('pt-BR')} • {selectedPixSub.planName}
                </p>
              </div>

              <div className="text-left space-y-1">
                <label className="block text-[11px] font-semibold text-gray-700">Código PIX Copia-e-Cola:</label>
                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs font-mono text-gray-800 break-all select-all">
                  <span className="truncate pr-2">{selectedPixSub.pixCopyPasteCode || '00020126580014br.gov.bcb.pix...'}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedPixSub.pixCopyPasteCode || 'admin@manyflow.io');
                      setCopiedPix(true);
                      setTimeout(() => setCopiedPix(false), 2000);
                    }}
                    className="p-1.5 bg-white border border-gray-200 hover:bg-gray-100 rounded text-gray-600 transition-colors flex-shrink-0"
                    title="Copiar código PIX"
                  >
                    {copiedPix ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedPixSub(null)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    handleConfirmPaid(selectedPixSub);
                    setSelectedPixSub(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Confirmar Pagamento Recebido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: WhatsApp Payment Reminder */}
      {reminderSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-green-50/50">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-green-600" />
                <h3 className="text-xs font-bold text-gray-900">Enviar Aviso de Cobrança WhatsApp</h3>
              </div>
              <button onClick={() => setReminderSub(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-500">Destinatário:</span> <strong className="text-gray-900">{reminderSub.userName}</strong>
                </div>
                <div>
                  <span className="text-gray-500">WhatsApp:</span> <strong className="text-gray-900">{reminderSub.userPhone || 'Não cadastrado'}</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mensagem Formatada para o WhatsApp</label>
                <textarea
                  rows={8}
                  value={customReminderMsg}
                  onChange={e => setCustomReminderMsg(e.target.value)}
                  className="w-full p-3 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-gray-800"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(customReminderMsg);
                    setCopiedMsg(true);
                    setTimeout(() => setCopiedMsg(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg"
                >
                  {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedMsg ? 'Mensagem Copiada!' : 'Copiar Texto'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReminderSub(null)}
                    className="px-3.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSendReminder}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Abrir WhatsApp & Registrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
