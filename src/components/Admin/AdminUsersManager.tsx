import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Crown, 
  Briefcase, 
  Headphones, 
  Eye, 
  EyeOff,
  Search, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3, 
  Key, 
  Mail, 
  Building2, 
  Check, 
  X, 
  RefreshCw, 
  Download, 
  Sparkles, 
  ShieldAlert, 
  Copy,
  Layers,
  Phone,
  Calendar,
  Package,
  Clock,
  AlertTriangle,
  Sliders,
  CheckSquare
} from 'lucide-react';
import { User, UserRole, SubscriptionPlan } from '../../types';
import { adminManagementService } from '../../services/adminManagementService';
import { plansAndAffiliatesService } from '../../services/plansAndAffiliatesService';
import { useAuth } from '../../context/AuthContext';

export const AdminUsersManager: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'users_list' | 'roles_matrix'>('users_list');

  // --- MODAL 1: CRIAR / EDITAR USUÁRIO GERAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'agent' as UserRole,
    tenantId: 'tenant_main',
    password: '',
    plan: 'pro',
    phone: '',
    isActive: true
  });
  const [isSaving, setIsSaving] = useState(false);

  // --- ITEM 1: MODAL TROCAR SENHA ---
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // --- ITEM 2: MODAL DATA DE VENCIMENTO ---
  const [expirationModalUser, setExpirationModalUser] = useState<User | null>(null);
  const [expirationDateValue, setExpirationDateValue] = useState('');
  const [blockOnExpireValue, setBlockOnExpireValue] = useState(true);
  const [expirationNotesValue, setExpirationNotesValue] = useState('');
  const [isSavingExpiration, setIsSavingExpiration] = useState(false);

  // --- ITEM 3: MODAL ADMINISTRAÇÃO DE PACOTE ---
  const [packageModalUser, setPackageModalUser] = useState<User | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState('pro');
  const [selectedPlanName, setSelectedPlanName] = useState('Profissional (Growth)');
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'quarterly' | 'semiannual' | 'yearly' | 'lifetime'>('monthly');
  const [customLimits, setCustomLimits] = useState({
    maxFlows: 25,
    maxContacts: 15000,
    maxUsers: 5,
    maxAiMessages: 2000,
    enableWebhooks: true,
    enableApi: true
  });
  const [packageNotes, setPackageNotes] = useState('');
  const [isSavingPackage, setIsSavingPackage] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allUsers, allPlans] = await Promise.all([
        adminManagementService.getAllUsers(),
        plansAndAffiliatesService.getPlans()
      ]);
      setUsers(allUsers);
      setPlans(allPlans);
    } catch (err) {
      console.warn('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- MODAL CRIAR / EDITAR HANDLERS ---
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'agent',
      tenantId: 'tenant_main',
      password: 'manyflow2026',
      plan: 'pro',
      phone: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      password: '',
      plan: user.plan || 'pro',
      phone: user.phone || '',
      isActive: user.isActive !== false
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      if (editingUser) {
        const res = await adminManagementService.updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          tenantId: formData.tenantId,
          isActive: formData.isActive,
          plan: formData.plan,
          phone: formData.phone,
          ...(formData.password ? { password: formData.password } : {})
        } as any);

        if (res.success) {
          setUsers(prev => prev.map(u => u.id === editingUser.id ? { 
            ...u, 
            ...formData, 
            updatedAt: new Date().toISOString() 
          } : u));
          setFeedback({ type: 'success', message: `Usuário ${formData.name} atualizado com sucesso!` });
          setIsModalOpen(false);
        } else {
          setFeedback({ type: 'error', message: res.error || 'Erro ao atualizar usuário' });
        }
      } else {
        const res = await adminManagementService.createUser({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          tenantId: formData.tenantId,
          password: formData.password,
          planId: formData.plan
        });

        if (res.success && res.user) {
          setUsers(prev => [res.user!, ...prev]);
          setFeedback({ type: 'success', message: `Usuário ${formData.name} criado e ativado na plataforma!` });
          setIsModalOpen(false);
        } else {
          setFeedback({ type: 'error', message: res.error || 'Erro ao criar usuário' });
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro inesperado' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const res = await adminManagementService.toggleUserActiveStatus(user.id);
    if (res.success) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: res.newStatus } : u));
      setFeedback({ 
        type: 'success', 
        message: `Status de ${user.name} alterado para ${res.newStatus ? 'Ativo' : 'Suspenso'}.` 
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('Você não pode excluir sua própria conta de administrador.');
      return;
    }
    if (!confirm(`Tem certeza que deseja remover permanentemente o usuário "${user.name}" (${user.email})?`)) {
      return;
    }

    const res = await adminManagementService.deleteUser(user.id);
    if (res.success) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setFeedback({ type: 'success', message: `Usuário ${user.name} removido com sucesso.` });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // --- ITEM 1: TROCAR SENHA ACTIONS ---
  const handleOpenChangePassword = (u: User) => {
    setPasswordModalUser(u);
    setNewPasswordValue('');
    setConfirmPasswordValue('');
    setShowPasswordText(false);
    setCopiedPassword(false);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 9; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const gen = `Mf#${pass}`;
    setNewPasswordValue(gen);
    setConfirmPasswordValue(gen);
    setShowPasswordText(true);
  };

  const handleConfirmChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;
    if (!newPasswordValue || newPasswordValue.length < 4) {
      setFeedback({ type: 'error', message: 'A nova senha deve ter pelo menos 4 caracteres.' });
      return;
    }
    if (confirmPasswordValue && newPasswordValue !== confirmPasswordValue) {
      setFeedback({ type: 'error', message: 'A confirmação de senha não coincide com a nova senha.' });
      return;
    }

    setIsChangingPassword(true);
    const res = await adminManagementService.changeUserPassword(passwordModalUser.id, newPasswordValue);
    setIsChangingPassword(false);

    if (res.success) {
      setFeedback({ 
        type: 'success', 
        message: `Senha de ${passwordModalUser.name} alterada com sucesso! A nova credencial já está ativa.` 
      });
      setPasswordModalUser(null);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Erro ao alterar senha do usuário.' });
    }
    setTimeout(() => setFeedback(null), 5000);
  };

  // --- ITEM 2: DATA DE VENCIMENTO ACTIONS ---
  const handleOpenExpirationModal = (u: User) => {
    setExpirationModalUser(u);
    const defaultDate = u.expiresAt || (u.role === 'super_admin' ? '' : new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setExpirationDateValue(defaultDate);
    setBlockOnExpireValue(u.blockOnExpire !== false);
    setExpirationNotesValue(u.notes || '');
  };

  const handleAddDaysToExpiration = (days: number) => {
    const base = expirationDateValue ? new Date(expirationDateValue) : new Date();
    base.setDate(base.getDate() + days);
    setExpirationDateValue(base.toISOString().split('T')[0]);
  };

  const handleSetLifetime = () => {
    setExpirationDateValue('');
    setBlockOnExpireValue(false);
  };

  const handleSaveExpiration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expirationModalUser) return;
    setIsSavingExpiration(true);

    const res = await adminManagementService.updateUserExpiration(expirationModalUser.id, {
      expiresAt: expirationDateValue || null,
      dueDate: expirationDateValue || undefined,
      blockOnExpire: blockOnExpireValue,
      notes: expirationNotesValue
    });
    setIsSavingExpiration(false);

    if (res.success) {
      setUsers(prev => prev.map(u => u.id === expirationModalUser.id ? { 
        ...u, 
        expiresAt: expirationDateValue || undefined, 
        dueDate: expirationDateValue || undefined,
        blockOnExpire: blockOnExpireValue,
        notes: expirationNotesValue,
        updatedAt: new Date().toISOString()
      } : u));
      setFeedback({ 
        type: 'success', 
        message: `Data de vencimento de ${expirationModalUser.name} atualizada com sucesso!` 
      });
      setExpirationModalUser(null);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Erro ao salvar vencimento.' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // --- ITEM 3: ADMINISTRAÇÃO DE PACOTE ACTIONS ---
  const handleOpenPackageModal = (u: User) => {
    setPackageModalUser(u);
    const currentPlan = u.plan || 'pro';
    setSelectedPlanId(currentPlan);
    setSelectedPlanName(u.planName || (
      currentPlan === 'enterprise' ? 'Enterprise VIP' : 
      currentPlan === 'starter' ? 'Starter' : 
      currentPlan === 'whitelabel' ? 'Agência White-Label' : 'Profissional (Growth)'
    ));
    setSelectedBillingCycle(u.billingCycle || 'monthly');
    setCustomLimits(u.customLimits || {
      maxFlows: currentPlan === 'starter' ? 5 : currentPlan === 'pro' ? 25 : 100,
      maxContacts: currentPlan === 'starter' ? 1000 : currentPlan === 'pro' ? 15000 : 100000,
      maxUsers: currentPlan === 'starter' ? 1 : currentPlan === 'pro' ? 5 : 20,
      maxAiMessages: currentPlan === 'starter' ? 500 : currentPlan === 'pro' ? 2000 : 10000,
      enableWebhooks: currentPlan !== 'starter',
      enableApi: currentPlan === 'enterprise' || currentPlan === 'whitelabel'
    });
    setPackageNotes(u.notes || '');
  };

  const handleSelectPlanPreset = (planKey: string, name: string) => {
    setSelectedPlanId(planKey);
    setSelectedPlanName(name);
    if (planKey === 'starter') {
      setCustomLimits({ maxFlows: 5, maxContacts: 1000, maxUsers: 1, maxAiMessages: 500, enableWebhooks: false, enableApi: false });
    } else if (planKey === 'pro') {
      setCustomLimits({ maxFlows: 25, maxContacts: 15000, maxUsers: 5, maxAiMessages: 2000, enableWebhooks: true, enableApi: false });
    } else if (planKey === 'enterprise') {
      setCustomLimits({ maxFlows: 100, maxContacts: 100000, maxUsers: 20, maxAiMessages: 10000, enableWebhooks: true, enableApi: true });
    } else if (planKey === 'whitelabel') {
      setCustomLimits({ maxFlows: 500, maxContacts: 500000, maxUsers: 50, maxAiMessages: 50000, enableWebhooks: true, enableApi: true });
    }
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageModalUser) return;
    setIsSavingPackage(true);

    const res = await adminManagementService.updateUserPackage(packageModalUser.id, {
      plan: selectedPlanId,
      planName: selectedPlanName,
      billingCycle: selectedBillingCycle,
      customLimits,
      notes: packageNotes
    });
    setIsSavingPackage(false);

    if (res.success) {
      setUsers(prev => prev.map(u => u.id === packageModalUser.id ? { 
        ...u, 
        plan: selectedPlanId, 
        planName: selectedPlanName,
        billingCycle: selectedBillingCycle,
        customLimits,
        notes: packageNotes,
        updatedAt: new Date().toISOString()
      } : u));
      setFeedback({ 
        type: 'success', 
        message: `Pacote e limites de ${packageModalUser.name} salvos com sucesso!` 
      });
      setPackageModalUser(null);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Erro ao atualizar pacote.' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // --- STATUS BADGES HELPERS ---
  const getExpirationStatus = (user: User) => {
    if (user.role === 'super_admin' || !user.expiresAt) {
      return { 
        label: 'Vitalício (Sem Vencimento)', 
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200', 
        isExpired: false 
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(user.expiresAt);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formattedDate = new Date(user.expiresAt).toLocaleDateString('pt-BR');

    if (diffDays < 0) {
      return { 
        label: `Vencido há ${Math.abs(diffDays)}d (${formattedDate})`, 
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold', 
        isExpired: true 
      };
    }
    if (diffDays <= 7) {
      return { 
        label: `Vence em ${diffDays}d (${formattedDate})`, 
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold', 
        isExpired: false 
      };
    }
    return { 
      label: `Vence: ${formattedDate}`, 
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
      isExpired: false 
    };
  };

  const renderPlanBadge = (user: User) => {
    const plan = user.plan || 'pro';
    switch (plan) {
      case 'enterprise':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Sparkles className="w-3 h-3 text-purple-600" /> Enterprise VIP
          </span>
        );
      case 'whitelabel':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Crown className="w-3 h-3 text-indigo-600" /> White-Label
          </span>
        );
      case 'starter':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Package className="w-3 h-3 text-emerald-600" /> Starter
          </span>
        );
      case 'pro':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Package className="w-3 h-3 text-blue-600" /> Pro Growth
          </span>
        );
    }
  };

  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Crown className="w-3 h-3 text-purple-600" /> Super Admin
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <ShieldCheck className="w-3 h-3 text-blue-600" /> Administrador
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Briefcase className="w-3 h-3 text-amber-600" /> Gerente
          </span>
        );
      case 'agent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Headphones className="w-3 h-3 text-emerald-600" /> Atendente
          </span>
        );
      case 'viewer':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <Eye className="w-3 h-3 text-gray-500" /> Visualizador
          </span>
        );
    }
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Nome', 'Email', 'Papel', 'Pacote', 'Vencimento', 'Workspace', 'Status', 'Criado Em'];
    const rows = filteredUsers.map(u => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.role,
      u.plan || 'pro',
      u.expiresAt || 'Vitalício',
      u.tenantId,
      u.isActive !== false ? 'Ativo' : 'Suspenso',
      u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '-'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `manyflow-usuarios-cadastrados-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.tenantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery)) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesPlan = planFilter === 'all' || (u.plan || 'pro') === planFilter;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && u.isActive !== false) || 
      (statusFilter === 'inactive' && u.isActive === false);

    return matchesSearch && matchesRole && matchesPlan && matchesStatus;
  });

  // Metric counts
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(u => u.isActive !== false).length;
  const adminUsersCount = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
  const proUsersCount = users.filter(u => u.plan === 'pro' || !u.plan).length;
  const vipUsersCount = users.filter(u => u.plan === 'enterprise' || u.plan === 'whitelabel').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F9FB] overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Gestão de Usuários Cadastrados</h1>
                <p className="text-xs text-gray-500">
                  Visualização de contas reais, troca imediata de senha, ajuste de vencimento e controle de pacotes
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-xs transition-colors cursor-pointer"
              title="Exportar base para CSV"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" /> Exportar CSV
            </button>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-xs transition-colors cursor-pointer"
              title="Recarregar lista do servidor"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Novo Usuário
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
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <ShieldAlert className="w-4 h-4 text-red-600" />}
              <span className="font-medium">{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 w-full space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-medium text-gray-500">Cadastros Totais</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-gray-900">{totalUsersCount}</span>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-[11px] text-gray-500 mt-1">Registrados no banco</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-200/70 shadow-xs flex flex-col justify-between bg-gradient-to-b from-white to-emerald-50/20">
            <span className="text-xs font-medium text-emerald-700">Contas Ativas</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-emerald-900">{activeUsersCount}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-[11px] text-emerald-600 mt-1">Acesso liberado</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-blue-200/70 shadow-xs flex flex-col justify-between bg-gradient-to-b from-white to-blue-50/20">
            <span className="text-xs font-medium text-blue-700">Administradores</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-blue-900">{adminUsersCount}</span>
              <Crown className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-[11px] text-blue-600 mt-1">Gestores do sistema</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-indigo-200/70 shadow-xs flex flex-col justify-between bg-gradient-to-b from-white to-indigo-50/20">
            <span className="text-xs font-medium text-indigo-700">Pacotes Pro</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-indigo-900">{proUsersCount}</span>
              <Package className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-[11px] text-indigo-600 mt-1">Plano intermediário</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-purple-200/70 shadow-xs flex flex-col justify-between bg-gradient-to-b from-white to-purple-50/20">
            <span className="text-xs font-medium text-purple-700">Enterprise & VIP</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-purple-900">{vipUsersCount}</span>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-[11px] text-purple-600 mt-1">Planos de alto volume</span>
          </div>
        </div>

        {/* View Switcher & Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Top Bar with Tabs and Search */}
          <div className="p-4 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('users_list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'users_list'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Lista de Usuários Cadastrados ({filteredUsers.length})
              </button>
              <button
                onClick={() => setActiveTab('roles_matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'roles_matrix'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Matriz de Permissões RBAC
              </button>
            </div>

            {activeTab === 'users_list' && (
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, email, telefone..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Todos os Papéis</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Administrador</option>
                  <option value="manager">Gerente</option>
                  <option value="agent">Atendente</option>
                  <option value="viewer">Visualizador</option>
                </select>

                {/* Plan Filter */}
                <select
                  value={planFilter}
                  onChange={e => setPlanFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Todos os Pacotes</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro Growth</option>
                  <option value="enterprise">Enterprise VIP</option>
                  <option value="whitelabel">White-Label</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Apenas Ativos</option>
                  <option value="inactive">Apenas Suspensos</option>
                </select>
              </div>
            )}
          </div>

          {/* Tab 1: Users List Table */}
          {activeTab === 'users_list' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3.5">Usuário / Identificação</th>
                    <th className="px-5 py-3.5">Permissão</th>
                    <th className="px-5 py-3.5">Pacote / Plano</th>
                    <th className="px-5 py-3.5">Data de Vencimento</th>
                    <th className="px-5 py-3.5">Workspace</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Ações Administrativas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                        <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="font-medium text-gray-700">Nenhum usuário encontrado</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Ajuste os filtros de busca ou crie um novo usuário no botão acima.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      const expStatus = getExpirationStatus(user);
                      return (
                        <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                          {/* User Identification */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0084FF&color=fff`}
                                alt={user.name}
                                className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                  {user.name}
                                  {user.id === currentUser?.id && (
                                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded">Você</span>
                                  )}
                                  {user.isDemo && (
                                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">Demonstrativo</span>
                                  )}
                                </div>
                                <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  <span>{user.email}</span>
                                </div>
                                {user.phone && (
                                  <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                    <Phone className="w-2.5 h-2.5" />
                                    <span>{user.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="px-5 py-3.5">
                            {renderRoleBadge(user.role)}
                          </td>

                          {/* Pacote / Plano */}
                          <td className="px-5 py-3.5">
                            <div className="flex flex-col gap-0.5 items-start">
                              {renderPlanBadge(user)}
                              <span className="text-[10px] text-gray-400">
                                Ciclo: {user.billingCycle === 'yearly' ? 'Anual' : user.billingCycle === 'lifetime' ? 'Vitalício' : 'Mensal'}
                              </span>
                            </div>
                          </td>

                          {/* Data de Vencimento */}
                          <td className="px-5 py-3.5">
                            <div className="flex flex-col gap-0.5 items-start">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border ${expStatus.badgeClass}`}>
                                <Calendar className="w-3 h-3" />
                                <span>{expStatus.label}</span>
                              </span>
                              {user.blockOnExpire && !expStatus.isExpired && user.expiresAt && (
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" /> Bloqueio automático ativo
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Workspace / Tenant */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                              <Building2 className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-mono text-[11px]">{user.tenantId || 'tenant_main'}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                user.isActive !== false
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                              }`}
                              title="Clique para alternar o status da conta"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${user.isActive !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              {user.isActive !== false ? 'Ativo' : 'Suspenso'}
                            </button>
                          </td>

                          {/* Ações Administrativas (Trocar Senha, Data Vencimento, Administração Pacote) */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* 1. Trocar Senha */}
                              <button
                                onClick={() => handleOpenChangePassword(user)}
                                className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                                title="Trocar Senha do Usuário"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>

                              {/* 2. Data de Vencimento */}
                              <button
                                onClick={() => handleOpenExpirationModal(user)}
                                className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                                title="Alterar Data de Vencimento"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                              </button>

                              {/* 3. Administração de Pacote */}
                              <button
                                onClick={() => handleOpenPackageModal(user)}
                                className="p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg border border-purple-200 transition-colors cursor-pointer"
                                title="Administrar Pacote & Limites"
                              >
                                <Package className="w-3.5 h-3.5" />
                              </button>

                              {/* Editar Dados Gerais */}
                              <button
                                onClick={() => openEditModal(user)}
                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                                title="Editar Cadastro Geral"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Excluir */}
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                                title="Remover Usuário"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: RBAC Matrix */}
          {activeTab === 'roles_matrix' && (
            <div className="p-6 space-y-6">
              <div className="max-w-3xl">
                <h3 className="text-sm font-bold text-gray-900">Matriz de Níveis de Acesso (RBAC)</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Defina claramente as responsabilidades de cada membro da equipe para manter o sistema seguro e organizado.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-purple-600" />
                    <h4 className="text-xs font-bold text-purple-900">Super Admin</h4>
                  </div>
                  <p className="text-[11px] text-purple-700 mb-3">
                    Acesso irrestrito a todos os workspaces, infraestrutura do servidor, gateway de pagamento, configurações globais e banco de dados.
                  </p>
                  <ul className="text-[11px] space-y-1 text-purple-800">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> Gerenciar mensalidades e faturas</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> Trocar senhas de qualquer usuário</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> Alterar data de vencimento e pacotes</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-blue-900">Administrador de Workspace</h4>
                  </div>
                  <p className="text-[11px] text-blue-700 mb-3">
                    Gerencia o workspace da sua empresa, integrações com WhatsApp e Instagram, canais de comunicação e contratação de pacotes.
                  </p>
                  <ul className="text-[11px] space-y-1 text-blue-800">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> Criar e publicar fluxos visuais</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> Disparo de campanhas em massa</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> Convidar atendentes e gerentes</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-bold text-amber-900">Gerente de Equipe</h4>
                  </div>
                  <p className="text-[11px] text-amber-700 mb-3">
                    Supervisiona os atendimentos ao vivo, métricas de funil, agendamentos e base de leads no CRM.
                  </p>
                  <ul className="text-[11px] space-y-1 text-amber-800">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-amber-600" /> Acompanhar fila do Live Chat</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-amber-600" /> Exportar contatos e leads</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-amber-600" /> Ver relatórios de conversão</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ITEM 1: MODAL TROCAR SENHA (ADMIN PASSWORD CHANGE) */}
      {/* ========================================================================= */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shadow-xs">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Trocar Senha de Usuário</h3>
                  <p className="text-xs text-gray-500">Defina uma nova senha para {passwordModalUser.name}</p>
                </div>
              </div>
              <button onClick={() => setPasswordModalUser(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmChangePassword} className="p-6 space-y-4">
              {/* User details recap */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                <img
                  src={passwordModalUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(passwordModalUser.name)}&background=0084FF&color=fff`}
                  alt={passwordModalUser.name}
                  className="w-8 h-8 rounded-full border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{passwordModalUser.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{passwordModalUser.email}</p>
                </div>
              </div>

              {/* Password Generator Button */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700">Nova Senha</label>
                <button
                  type="button"
                  onClick={handleGenerateRandomPassword}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Gerar Senha Segura
                </button>
              </div>

              {/* Input: Nova Senha */}
              <div className="relative">
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  required
                  placeholder="Mínimo de 4 caracteres"
                  value={newPasswordValue}
                  onChange={e => setNewPasswordValue(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 text-xs font-mono bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordText(!showPasswordText)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Input: Confirmar Nova Senha */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Confirmar Nova Senha</label>
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  required
                  placeholder="Repita a nova senha"
                  value={confirmPasswordValue}
                  onChange={e => setConfirmPasswordValue(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-mono bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Copy quick action */}
              {newPasswordValue && (
                <div className="flex items-center justify-between p-2.5 bg-amber-50/50 rounded-xl border border-amber-200">
                  <span className="text-[11px] text-amber-800">Copiar credencial para envio:</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(newPasswordValue);
                      setCopiedPassword(true);
                      setTimeout(() => setCopiedPassword(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-amber-300 rounded-md text-[11px] font-bold text-amber-800 hover:bg-amber-100 cursor-pointer"
                  >
                    {copiedPassword ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedPassword ? 'Copiada!' : 'Copiar'}
                  </button>
                </div>
              )}

              <p className="text-[11px] text-gray-500">
                A nova senha entrará em vigor imediatamente. O usuário precisará utilizar esta nova credencial no próximo login.
              </p>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword || !newPasswordValue}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isChangingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{isChangingPassword ? 'Salvando...' : 'Salvar Nova Senha'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ITEM 2: MODAL DATA DE VENCIMENTO (EXPIRATION DATE & BLOCKING) */}
      {/* ========================================================================= */}
      {expirationModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-blue-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Data de Vencimento da Conta</h3>
                  <p className="text-xs text-gray-500">Validade do plano de {expirationModalUser.name}</p>
                </div>
              </div>
              <button onClick={() => setExpirationModalUser(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpiration} className="p-6 space-y-4">
              {/* User overview */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900">{expirationModalUser.name}</p>
                  <p className="text-[11px] text-gray-500">{expirationModalUser.email}</p>
                </div>
                {renderPlanBadge(expirationModalUser)}
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Data Limite de Vencimento
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={expirationDateValue}
                    onChange={e => setExpirationDateValue(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                  />
                </div>
                {!expirationDateValue && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    ✓ Modo Vitalício / Sem expiração selecionado.
                  </p>
                )}
              </div>

              {/* Quick Presets Buttons */}
              <div>
                <span className="text-[11px] font-semibold text-gray-500 mb-1.5 block">Atalhos de Renovação Rápida:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddDaysToExpiration(30)}
                    className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors cursor-pointer"
                  >
                    +30 Dias (1 Mês)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDaysToExpiration(90)}
                    className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors cursor-pointer"
                  >
                    +90 Dias (Trimestral)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDaysToExpiration(180)}
                    className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors cursor-pointer"
                  >
                    +180 Dias (Semestre)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDaysToExpiration(365)}
                    className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors cursor-pointer"
                  >
                    +1 Ano (Anual)
                  </button>
                  <button
                    type="button"
                    onClick={handleSetLifetime}
                    className="col-span-2 px-2.5 py-1.5 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Crown className="w-3.5 h-3.5 text-purple-600" />
                    Acesso Vitalício (Sem Expiração)
                  </button>
                </div>
              </div>

              {/* Block on Expire Toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Bloquear Acesso Automaticamente</span>
                  <span className="text-[11px] text-gray-500">Suspende o login do usuário se a data estiver vencida</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blockOnExpireValue}
                    onChange={e => setBlockOnExpireValue(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Observações / Histórico de Renovação
                </label>
                <input
                  type="text"
                  placeholder="Ex: Renovação confirmada via PIX no dia 03/09"
                  value={expirationNotesValue}
                  onChange={e => setExpirationNotesValue(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setExpirationModalUser(null)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingExpiration}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isSavingExpiration ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{isSavingExpiration ? 'Salvando...' : 'Salvar Vencimento'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ITEM 3: MODAL ADMINISTRAÇÃO DE PACOTE & LIMITES */}
      {/* ========================================================================= */}
      {packageModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-purple-50/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-xs">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Administração de Pacote & Limites</h3>
                  <p className="text-xs text-gray-500">Configuração de plano e capacidades para {packageModalUser.name}</p>
                </div>
              </div>
              <button onClick={() => setPackageModalUser(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="p-6 space-y-4 overflow-y-auto">
              {/* Plan Preset Cards */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Selecione o Plano da Plataforma:</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Starter */}
                  <div
                    onClick={() => handleSelectPlanPreset('starter', 'Iniciante (Starter)')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedPlanId === 'starter'
                        ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-900">Starter</span>
                      <span className="text-[11px] font-bold text-emerald-600">R$ 97/mês</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      1.000 contatos • 5 fluxos • 1 usuário
                    </p>
                  </div>

                  {/* Pro Growth */}
                  <div
                    onClick={() => handleSelectPlanPreset('pro', 'Profissional (Growth)')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedPlanId === 'pro'
                        ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-900">Pro Growth</span>
                      <span className="text-[11px] font-bold text-blue-600">R$ 197/mês</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      15.000 contatos • 25 fluxos • 5 usuários • IA
                    </p>
                  </div>

                  {/* Enterprise VIP */}
                  <div
                    onClick={() => handleSelectPlanPreset('enterprise', 'Enterprise VIP')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedPlanId === 'enterprise'
                        ? 'border-purple-500 bg-purple-50/40 ring-2 ring-purple-500/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-900">Enterprise VIP</span>
                      <span className="text-[11px] font-bold text-purple-600">R$ 497/mês</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      100.000 contatos • 100 fluxos • 20 operadores
                    </p>
                  </div>

                  {/* White-Label Reseller */}
                  <div
                    onClick={() => handleSelectPlanPreset('whitelabel', 'Agência White-Label')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedPlanId === 'whitelabel'
                        ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-900">Agência White-Label</span>
                      <span className="text-[11px] font-bold text-indigo-600">R$ 997/mês</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Sub-contas • CNAME próprio • Ilimitado
                    </p>
                  </div>
                </div>
              </div>

              {/* Ciclo de Cobrança */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Ciclo de Cobrança</label>
                  <select
                    value={selectedBillingCycle}
                    onChange={e => setSelectedBillingCycle(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="monthly">Mensal</option>
                    <option value="quarterly">Trimestral (-10%)</option>
                    <option value="semiannual">Semestral (-15%)</option>
                    <option value="yearly">Anual (-20%)</option>
                    <option value="lifetime">Vitalício (Pago Único)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nome de Exibição do Pacote</label>
                  <input
                    type="text"
                    value={selectedPlanName}
                    onChange={e => setSelectedPlanName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>
              </div>

              {/* Custom Limits Box */}
              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                  <Sliders className="w-3.5 h-3.5 text-purple-600" />
                  <span>Limites e Capacidades Personalizadas</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Max Fluxos</label>
                    <input
                      type="number"
                      value={customLimits.maxFlows}
                      onChange={e => setCustomLimits({ ...customLimits, maxFlows: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Max Contatos CRM</label>
                    <input
                      type="number"
                      value={customLimits.maxContacts}
                      onChange={e => setCustomLimits({ ...customLimits, maxContacts: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Max Operadores / Usuários</label>
                    <input
                      type="number"
                      value={customLimits.maxUsers}
                      onChange={e => setCustomLimits({ ...customLimits, maxUsers: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Max Mensagens IA/mês</label>
                    <input
                      type="number"
                      value={customLimits.maxAiMessages}
                      onChange={e => setCustomLimits({ ...customLimits, maxAiMessages: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customLimits.enableWebhooks}
                      onChange={e => setCustomLimits({ ...customLimits, enableWebhooks: e.target.checked })}
                      className="w-3.5 h-3.5 text-purple-600 rounded border-gray-300"
                    />
                    <span>Webhooks Liberados</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customLimits.enableApi}
                      onChange={e => setCustomLimits({ ...customLimits, enableApi: e.target.checked })}
                      className="w-3.5 h-3.5 text-purple-600 rounded border-gray-300"
                    />
                    <span>API REST Liberada</span>
                  </label>
                </div>
              </div>

              {/* Admin Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Observações Internas</label>
                <input
                  type="text"
                  placeholder="Ex: Upgrade concedido por fidelidade ou contrato anual"
                  value={packageNotes}
                  onChange={e => setPackageNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPackageModalUser(null)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingPackage}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isSavingPackage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{isSavingPackage ? 'Salvando...' : 'Salvar Pacote & Limites'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL GERAL: CRIAR / EDITAR DADOS GERAIS DO USUÁRIO */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  {editingUser ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  {editingUser ? 'Editar Cadastro do Usuário' : 'Criar Novo Usuário no Sistema'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">E-mail de Acesso</label>
                <input
                  type="email"
                  required
                  placeholder="joao@empresa.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    placeholder="+55 (11) 99999-9999"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nível de Acesso (Role)</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Administrador</option>
                    <option value="manager">Gerente</option>
                    <option value="agent">Atendente (Inbox)</option>
                    <option value="viewer">Visualizador</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Pacote / Plano</label>
                  <select
                    value={formData.plan}
                    onChange={e => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="starter">Starter (R$ 97)</option>
                    <option value="pro">Pro Growth (R$ 197)</option>
                    <option value="enterprise">Enterprise VIP (R$ 497)</option>
                    <option value="whitelabel">White-Label (R$ 997)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Workspace Atribuído</label>
                  <input
                    type="text"
                    value={formData.tenantId}
                    onChange={e => setFormData({ ...formData, tenantId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="tenant_main"
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Senha de Acesso Inicial</label>
                  <input
                    type="text"
                    placeholder="Senha temporária"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span>Usuário Ativo com Acesso Permitido</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  {isSaving ? 'Salvando...' : editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
