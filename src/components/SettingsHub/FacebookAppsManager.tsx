import React, { useState, useEffect } from 'react';
import { 
  Facebook, 
  Plus, 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Zap, 
  Instagram, 
  MessageCircle, 
  Users, 
  Key, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Activity, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  CheckCircle, 
  X, 
  Flame, 
  Radio, 
  Cpu, 
  Server, 
  TrendingUp, 
  Sliders, 
  Star,
  Smartphone
} from 'lucide-react';
import { FacebookApp, FacebookAppType, FacebookAppStatus, FacebookPageAsset, FacebookWhatsAppAsset, User } from '../../types';
import { facebookAppsService, TestFacebookConnectionResult } from '../../services/facebookAppsService';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

interface FacebookAppsManagerProps {
  onSelectActiveApp?: (app: FacebookApp) => void;
}

export const FacebookAppsManager: React.FC<FacebookAppsManagerProps> = ({
  onSelectActiveApp
}) => {
  const { user: currentUser, tenant } = useAuth();
  const [apps, setApps] = useState<FacebookApp[]>([]);
  const [teamUsers, setTeamUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  
  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestFacebookConnectionResult | null>(null);
  const [isTestingLoading, setIsTestingLoading] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [syncTargetApp, setSyncTargetApp] = useState<FacebookApp | null>(null);
  const [isTutorialExpanded, setIsTutorialExpanded] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    appId: string;
    appSecret: string;
    appType: FacebookAppType;
    status: FacebookAppStatus;
    apiVersion: string;
    ownerUserId: string;
    assignedUserIds: string[];
    systemUserToken: string;
    verifyToken: string;
    approvedPermissions: string[];
    isDefault: boolean;
    notes: string;
  }>({
    name: '',
    appId: '',
    appSecret: '',
    appType: 'business',
    status: 'active',
    apiVersion: 'v21.0',
    ownerUserId: currentUser?.id || 'usr_super_1',
    assignedUserIds: ['all'],
    systemUserToken: '',
    verifyToken: 'manyflow_verify_token_2026',
    approvedPermissions: [
      'pages_messaging',
      'instagram_manage_messages',
      'pages_read_engagement',
      'pages_manage_metadata',
      'instagram_basic'
    ],
    isDefault: false,
    notes: ''
  });

  // Copied state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSecretMap, setShowSecretMap] = useState<Record<string, boolean>>({});
  const [showTokenMap, setShowTokenMap] = useState<Record<string, boolean>>({});
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load apps and users
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedApps, fetchedUsers] = await Promise.all([
        facebookAppsService.getApps(tenant?.id, currentUser?.id, currentUser?.role),
        authService.getUsers(tenant?.id || 'tenant_main')
      ]);
      setApps(fetchedApps);
      setTeamUsers(fetchedUsers || []);
    } catch (err) {
      console.error('Erro ao carregar apps de facebook:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenant?.id, currentUser?.id]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setActionFeedback({ type, message });
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingAppId(null);
    setFormData({
      name: '',
      appId: '',
      appSecret: '',
      appType: 'business',
      status: 'active',
      apiVersion: 'v21.0',
      ownerUserId: currentUser?.id || 'usr_super_1',
      assignedUserIds: ['all'],
      systemUserToken: '',
      verifyToken: `manyflow_${Math.random().toString(36).substring(2, 10)}_token`,
      approvedPermissions: [
        'pages_messaging',
        'instagram_manage_messages',
        'pages_read_engagement',
        'pages_manage_metadata',
        'instagram_basic'
      ],
      isDefault: apps.length === 0,
      notes: ''
    });
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (app: FacebookApp) => {
    setEditingAppId(app.id);
    setFormData({
      name: app.name,
      appId: app.appId,
      appSecret: app.appSecret || '',
      appType: app.appType,
      status: app.status,
      apiVersion: app.apiVersion || 'v21.0',
      ownerUserId: app.ownerUserId,
      assignedUserIds: app.assignedUserIds || ['all'],
      systemUserToken: app.systemUserToken || '',
      verifyToken: app.verifyToken || 'manyflow_verify_token_2026',
      approvedPermissions: app.approvedPermissions || [],
      isDefault: app.isDefault,
      notes: app.notes || ''
    });
    setIsFormModalOpen(true);
  };

  // Save Form (Create / Update)
  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.appId.trim()) {
      showToast('error', 'Nome do App e App ID são obrigatórios.');
      return;
    }

    const ownerUser = teamUsers.find(u => u.id === formData.ownerUserId) || currentUser;
    const webhookUrl = facebookAppsService.generateWebhookUrl(formData.appId);

    if (editingAppId) {
      // Update
      const updated = await facebookAppsService.updateApp(editingAppId, {
        ...formData,
        ownerUserName: ownerUser?.name || 'Administrador',
        ownerUserEmail: ownerUser?.email || 'admin@manyflow.com',
        webhookCallbackUrl: webhookUrl
      });
      if (updated) {
        showToast('success', `App "${updated.name}" atualizado com sucesso!`);
        setIsFormModalOpen(false);
        loadData();
      }
    } else {
      // Create
      const newApp = await facebookAppsService.createApp({
        ...formData,
        ownerUserName: ownerUser?.name || 'Administrador',
        ownerUserEmail: ownerUser?.email || 'admin@manyflow.com',
        tenantId: tenant?.id || 'tenant_main',
        webhookCallbackUrl: webhookUrl,
        isWebhookLive: true,
        pages: [],
        whatsAppAccounts: []
      });
      showToast('success', `Novo App de Facebook "${newApp.name}" adicionado com sucesso!`);
      setIsFormModalOpen(false);
      loadData();
    }
  };

  // Delete App
  const handleDeleteApp = async (app: FacebookApp) => {
    if (confirm(`Tem certeza que deseja remover o app "${app.name}" (ID: ${app.appId})? Esta ação não pode ser desfeita.`)) {
      await facebookAppsService.deleteApp(app.id);
      showToast('success', `App "${app.name}" removido com sucesso.`);
      loadData();
    }
  };

  // Set as Default App
  const handleSetDefault = async (app: FacebookApp) => {
    await facebookAppsService.setDefaultApp(app.id, tenant?.id);
    showToast('success', `"${app.name}" definido como App Principal do workspace!`);
    loadData();
  };

  // Test Connection Modal
  const handleTestConnection = async (app: FacebookApp) => {
    setSyncTargetApp(app);
    setIsTestModalOpen(true);
    setIsTestingLoading(true);
    setTestResult(null);

    try {
      const result = await facebookAppsService.testConnection(app);
      setTestResult(result);
    } catch {
      showToast('error', 'Falha ao testar conexão com a Meta Graph API.');
    } finally {
      setIsTestingLoading(false);
    }
  };

  // Open Sync Pages Modal
  const handleOpenSyncModal = (app: FacebookApp) => {
    setSyncTargetApp(app);
    setIsSyncModalOpen(true);
  };

  // Perform Sync Pages
  const handleSyncPages = async () => {
    if (!syncTargetApp) return;
    setIsTestingLoading(true);
    try {
      const newPages = await facebookAppsService.syncPagesFromMeta(syncTargetApp.appId);
      const updatedPages = [...syncTargetApp.pages, ...newPages];
      await facebookAppsService.updateApp(syncTargetApp.id, { pages: updatedPages });
      showToast('success', `${newPages.length} nova(s) página(s) sincronizada(s) da Meta!`);
      setIsSyncModalOpen(false);
      loadData();
    } catch {
      showToast('error', 'Falha ao sincronizar páginas da Meta.');
    } finally {
      setIsTestingLoading(false);
    }
  };

  // Filtered Apps
  const filteredApps = apps.filter(app => {
    // User filter
    if (selectedUserFilter === 'my_apps') {
      if (app.ownerUserId !== currentUser?.id) return false;
    } else if (selectedUserFilter !== 'all') {
      if (app.ownerUserId !== selectedUserFilter) return false;
    }

    // Status filter
    if (selectedStatusFilter !== 'all') {
      if (app.status !== selectedStatusFilter) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = app.name.toLowerCase().includes(query);
      const matchAppId = app.appId.includes(query);
      const matchOwner = (app.ownerUserName || '').toLowerCase().includes(query);
      const matchPage = app.pages.some(p => p.name.toLowerCase().includes(query) || (p.instagramUsername || '').toLowerCase().includes(query));
      return matchName || matchAppId || matchOwner || matchPage;
    }

    return true;
  });

  // Permissions Available
  const AVAILABLE_PERMISSIONS = [
    { key: 'pages_messaging', label: 'pages_messaging', desc: 'Envio e recebimento de mensagens no Facebook Messenger' },
    { key: 'instagram_manage_messages', label: 'instagram_manage_messages', desc: 'DMs, respostas a stories e automações no Instagram' },
    { key: 'pages_read_engagement', label: 'pages_read_engagement', desc: 'Leitura de comentários em posts e Reels' },
    { key: 'pages_manage_metadata', label: 'pages_manage_metadata', desc: 'Assinatura e gerenciamento de Webhooks' },
    { key: 'whatsapp_business_management', label: 'whatsapp_business_management', desc: 'Gestão de números e templates do WhatsApp Cloud API' },
    { key: 'leads_retrieval', label: 'leads_retrieval', desc: 'Captura instantânea de Lead Ads' },
    { key: 'instagram_basic', label: 'instagram_basic', desc: 'Acesso a perfil, bio e contagem de seguidores' },
    { key: 'public_profile', label: 'public_profile', desc: 'Dados básicos da conta Meta' }
  ];

  return (
    <div id="facebook_apps_manager_module" className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {actionFeedback && (
        <div className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold shadow-md transition-all ${
          actionFeedback.type === 'success' 
            ? 'bg-emerald-600 text-white' 
            : 'bg-rose-600 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{actionFeedback.message}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="cursor-pointer hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner / Summary */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-sm border border-blue-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-blue-500/30 text-blue-200 border border-blue-400/30 flex items-center gap-1.5">
                <Facebook className="w-3.5 h-3.5 text-blue-400" />
                Meta Developer Apps • Multi-Contas
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Graph API v21.0
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
              Gerenciador de Aplicativos Facebook & Meta
            </h2>
            <p className="text-xs text-blue-100/80 leading-relaxed">
              Cada usuário e membro da equipe pode cadastrar e gerenciar múltiplos Aplicativos Meta (App ID / Secret). Conecte dezenas de Páginas do Facebook, perfis do Instagram Direct e contas WhatsApp Cloud API em paralelo.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsTutorialExpanded(!isTutorialExpanded)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 flex items-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-blue-300" />
              <span>Como Criar App no Meta</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Adicionar App Facebook</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider block">Apps Cadastrados</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{apps.length}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">{apps.filter(a => a.status === 'active').length} ativos</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider block">Páginas Facebook</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">
                {apps.reduce((acc, a) => acc + (a.pages?.length || 0), 0)}
              </span>
              <span className="text-[10px] text-blue-300">vinculadas</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider block">Contas Instagram</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">
                {apps.reduce((acc, a) => acc + (a.pages?.filter(p => p.instagramBusinessId)?.length || 0), 0)}
              </span>
              <span className="text-[10px] text-pink-300">Direct ativo</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider block">Média de Rate Limit</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">
                {Math.round(apps.reduce((acc, a) => acc + (a.rateLimitUsagePercent || 0), 0) / (apps.length || 1))}%
              </span>
              <span className="text-[10px] text-emerald-300">Cota Saudável</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Meta Developer Guide (Expandable) */}
      {isTutorialExpanded && (
        <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-[#1A1D21]">
                Guia Rápido: Como Criar e Conectar seu App no Meta for Developers
              </h3>
            </div>
            <button 
              onClick={() => setIsTutorialExpanded(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-[11px]">
                1
              </div>
              <h4 className="font-bold text-slate-800">Criar o App na Meta</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Acesse <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline inline-flex items-center gap-0.5">developers.facebook.com <ExternalLink className="w-2.5 h-2.5" /></a>, clique em <strong>Criar Aplicativo</strong> e selecione o tipo <strong>Outro ➔ Negócios (Business)</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-[11px]">
                2
              </div>
              <h4 className="font-bold text-slate-800">Adicionar Produtos</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                No painel do App, clique em <strong>Adicionar Produto</strong> e ative: <strong>Messenger</strong>, <strong>Instagram Graph API</strong> e <strong>Webhooks</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-[11px]">
                3
              </div>
              <h4 className="font-bold text-slate-800">Copiar App ID e Secret</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Vá em <strong>Configurações do App ➔ Básico</strong>. Copie o <strong>ID do Aplicativo</strong> e a <strong>Chave Secreta do Aplicativo</strong> e cole no formulário abaixo.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-[11px]">
                4
              </div>
              <h4 className="font-bold text-slate-800">Configurar Webhook</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                No produto Webhooks da Meta, cole a <strong>URL de Retorno de Chamada (Callback URL)</strong> e o <strong>Verify Token</strong> gerados pelo ManyFlow.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Nome do App, App ID, Página ou @instagram..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#0084FF] focus:border-[#0084FF]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* User / Owner Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="text-[#64748B] font-semibold text-[11px]">Usuário:</span>
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs font-semibold text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
            >
              <option value="all">Todos da Equipe ({apps.length})</option>
              <option value="my_apps">Apenas Meus Apps ({apps.filter(a => a.ownerUserId === currentUser?.id).length})</option>
              {teamUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({apps.filter(a => a.ownerUserId === u.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="text-[#64748B] font-semibold text-[11px]">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs font-semibold text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
            >
              <option value="all">Todos os Status</option>
              <option value="active">🟢 Ativo (Live)</option>
              <option value="development">🟡 Sandbox (Dev)</option>
              <option value="token_expired">🔴 Token Expirado</option>
            </select>
          </div>

          <button
            onClick={loadData}
            title="Atualizar lista"
            className="p-2 rounded-lg bg-[#F8F9FB] hover:bg-slate-100 border border-[#E2E8F0] text-[#64748B] hover:text-[#1A1D21] transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Apps Grid */}
      {filteredApps.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Facebook className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-[#1A1D21]">Nenhum App de Facebook encontrado</h3>
            <p className="text-xs text-[#64748B]">
              {searchQuery || selectedUserFilter !== 'all' || selectedStatusFilter !== 'all'
                ? 'Nenhum resultado corresponde aos filtros selecionados. Tente limpar os filtros de busca.'
                : 'Você ainda não possui nenhum App de Facebook cadastrado para este usuário ou workspace.'}
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Meu Primeiro App</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredApps.map((app) => {
            const isOwner = app.ownerUserId === currentUser?.id || currentUser?.role === 'super_admin' || currentUser?.role === 'admin';
            const showSecret = Boolean(showSecretMap[app.id]);
            const showToken = Boolean(showTokenMap[app.id]);

            return (
              <div
                key={app.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all hover:shadow-md space-y-4 relative ${
                  app.isDefault ? 'border-blue-300 ring-1 ring-blue-100' : 'border-[#E2E8F0]'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Facebook className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-[#1A1D21] truncate">
                          {app.name}
                        </h3>

                        {app.isDefault && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-blue-600 text-blue-600" />
                            Padrão
                          </span>
                        )}

                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${
                          app.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : app.status === 'development' 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            app.status === 'active' ? 'bg-emerald-500' : app.status === 'development' ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          {app.status === 'active' ? 'Ativo (Live)' : app.status === 'development' ? 'Sandbox (Dev)' : 'Token Expirado'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#64748B] flex-wrap">
                        <span className="font-mono font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                          App ID: {app.appId}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <Users className="w-3 h-3 text-slate-400" />
                          Dono: <strong>{app.ownerUserName || 'Admin'}</strong>
                        </span>
                        <span>•</span>
                        <span className="text-slate-500 font-mono">
                          Graph {app.apiVersion || 'v21.0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Dropdown / Quick Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleTestConnection(app)}
                      title="Testar Conexão Graph API"
                      className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all cursor-pointer text-xs font-semibold flex items-center gap-1"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Testar</span>
                    </button>

                    {isOwner && (
                      <button
                        onClick={() => handleOpenEditModal(app)}
                        title="Editar Configurações"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isOwner && !app.isDefault && (
                      <button
                        onClick={() => handleDeleteApp(app)}
                        title="Excluir App"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Rate Limit Meter */}
                <div className="space-y-1.5 bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-600" />
                      Consumo de Rate Limit (Cota Graph API)
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {app.rateLimitUsagePercent}% usado (200 chamadas/hora/usuário)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        app.rateLimitUsagePercent > 80 
                          ? 'bg-rose-500' 
                          : app.rateLimitUsagePercent > 50 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(app.rateLimitUsagePercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Webhook & Credentials Preview */}
                <div className="space-y-2 text-xs">
                  {/* Callback URL */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-600">Webhook Callback URL</span>
                      <button
                        onClick={() => copyToClipboard(app.webhookCallbackUrl, `cb_${app.id}`)}
                        className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === `cb_${app.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === `cb_${app.id}` ? 'Copiado!' : 'Copiar URL'}</span>
                      </button>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100/90 font-mono text-[11px] text-blue-800 truncate border border-slate-200 select-all">
                      {app.webhookCallbackUrl}
                    </div>
                  </div>

                  {/* Verify Token & App Secret */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-600">Verify Token</span>
                        <button
                          onClick={() => copyToClipboard(app.verifyToken, `vfy_${app.id}`)}
                          className="text-[10px] text-blue-600 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === `vfy_${app.id}` ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                        </button>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-100 font-mono text-[11px] text-slate-700 truncate border border-slate-200">
                        {app.verifyToken}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-600">App Secret</span>
                        <button
                          onClick={() => setShowSecretMap(prev => ({ ...prev, [app.id]: !prev[app.id] }))}
                          className="text-[10px] text-slate-500 hover:text-slate-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {showSecret ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                        </button>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-100 font-mono text-[11px] text-slate-700 truncate border border-slate-200">
                        {showSecret ? (app.appSecret || 'Não configurado') : '••••••••••••••••'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connected Assets Section */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1A1D21] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      Ativos Conectados a este App ({app.pages.length} páginas)
                    </span>
                    <button
                      onClick={() => handleOpenSyncModal(app)}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Sincronizar Páginas</span>
                    </button>
                  </div>

                  {app.pages.length === 0 ? (
                    <div className="p-2.5 rounded-lg bg-slate-50 text-center text-[11px] text-slate-500 border border-slate-200">
                      Nenhuma página ou perfil vinculado a este app ainda. Clique em "Sincronizar Páginas".
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {app.pages.map((page) => (
                        <div key={page.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs transition-all">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={page.instagramAvatarUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'}
                              alt={page.name}
                              className="w-6 h-6 rounded-md object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 truncate block text-[11px]">
                                {page.name}
                              </span>
                              {page.instagramUsername && (
                                <span className="text-[10px] text-pink-600 font-semibold flex items-center gap-1">
                                  <Instagram className="w-2.5 h-2.5" />
                                  {page.instagramUsername}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 text-[10px]">
                            <span className="text-slate-500">{(page.followersCount || 0).toLocaleString('pt-BR')} seg</span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                              Webhook OK
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* WhatsApp Assets if any */}
                  {app.whatsAppAccounts && app.whatsAppAccounts.length > 0 && (
                    <div className="mt-1">
                      {app.whatsAppAccounts.map(w => (
                        <div key={w.phoneNumberId} className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-bold text-emerald-900">{w.verifiedName}</span>
                            <span className="text-emerald-700 font-mono">({w.displayPhoneNumber})</span>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900">
                            WABA Ativo
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {!app.isDefault && (
                      <button
                        onClick={() => handleSetDefault(app)}
                        className="text-[11px] text-slate-600 hover:text-blue-600 font-bold px-2 py-1 rounded hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" />
                        <span>Tornar Padrão</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestConnection(app)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Activity className="w-3.5 h-3.5 text-blue-600" />
                      <span>Diagnóstico API</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADICIONAR / EDITAR APP DE FACEBOOK */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Facebook className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1A1D21]">
                    {editingAppId ? 'Editar Aplicativo de Facebook' : 'Adicionar Novo Aplicativo de Facebook'}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Configure as credenciais da Meta Graph API para seu usuário ou agência.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveApp} className="p-6 space-y-5">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  1. Informações Básicas do Aplicativo
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome de Identificação do App *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: App Principal - Agência Alpha"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Proprietário / Usuário Responsável *
                    </label>
                    <select
                      value={formData.ownerUserId}
                      onChange={(e) => setFormData({ ...formData, ownerUserId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:ring-1 focus:ring-blue-600 focus:outline-none font-medium"
                    >
                      {teamUsers.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tipo do App Meta
                    </label>
                    <select
                      value={formData.appType}
                      onChange={(e) => setFormData({ ...formData, appType: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="business">Empresa / Negócios (Business)</option>
                      <option value="consumer">Consumidor (Consumer)</option>
                      <option value="gaming">Jogos (Gaming)</option>
                      <option value="none">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Status da Aplicação
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="active">🟢 Em Produção (Live)</option>
                      <option value="development">🟡 Desenvolvimento (Sandbox)</option>
                      <option value="token_expired">🔴 Token Expirado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Versão Graph API
                    </label>
                    <select
                      value={formData.apiVersion}
                      onChange={(e) => setFormData({ ...formData, apiVersion: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
                    >
                      <option value="v21.0">v21.0 (Recomendada)</option>
                      <option value="v20.0">v20.0</option>
                      <option value="v19.0">v19.0</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Meta Credentials */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Key className="w-3.5 h-3.5" />
                  2. Credenciais Meta for Developers
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ID do Aplicativo (App ID) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 982736154819203"
                      value={formData.appId}
                      onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs font-mono text-[#1A1D21] focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chave Secreta do Aplicativo (App Secret)
                    </label>
                    <input
                      type="password"
                      placeholder="Ex: a8f9b2c3d4e5f67a8b9c0d1e2f3a4b5c"
                      value={formData.appSecret}
                      onChange={(e) => setFormData({ ...formData, appSecret: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs font-mono text-[#1A1D21] focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Token de Acesso do Usuário do Sistema (System User Token) ou Token de Página
                  </label>
                  <input
                    type="password"
                    placeholder="EAAO... (Cole o token permanente gerado no Meta Business Suite)"
                    value={formData.systemUserToken}
                    onChange={(e) => setFormData({ ...formData, systemUserToken: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs font-mono text-[#1A1D21] focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Dica: Crie um Usuário do Sistema no Meta Business Suite com a função "Administrador" para obter um token permanente sem expiração de 60 dias.
                  </p>
                </div>
              </div>

              {/* Webhook & Security */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Radio className="w-3.5 h-3.5" />
                  3. Token de Validação do Webhook (Verify Token)
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Token de Verificação Customizado
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.verifyToken}
                    onChange={(e) => setFormData({ ...formData, verifyToken: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs font-mono text-[#1A1D21] focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Cole exatamente este token no campo "Token de Verificação" no painel da Meta ao cadastrar o Webhook.
                  </p>
                </div>
              </div>

              {/* Permissions & Default Checkbox */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk_is_default"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="chk_is_default" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Definir este aplicativo como Padrão do Workspace
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingAppId ? 'Salvar Alterações' : 'Salvar e Conectar App'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TESTAR CONEXÃO COM GRAPH API */}
      {/* ========================================================================= */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-[#1A1D21]">
                  Diagnóstico de Conexão com a Meta Graph API
                </h3>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {isTestingLoading ? (
                <div className="py-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">
                    Realizando handshake com a Graph API da Meta...
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Verificando App Secret, escopos de permissões e latência do servidor.
                  </p>
                </div>
              ) : testResult ? (
                <div className="space-y-4 text-xs">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl flex items-start gap-3 ${
                    testResult.success ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}>
                    {testResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
                    <div className="space-y-1">
                      <h4 className="font-bold">
                        {testResult.success ? 'Conexão Estabelecida com Sucesso!' : 'Falha na Validação da Conexão'}
                      </h4>
                      <p className="text-[11px] opacity-90 leading-relaxed">
                        {testResult.message}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Latência do Ping</span>
                      <span className="text-sm font-black text-slate-900 font-mono">{testResult.latencyMs} ms</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Versão da API</span>
                      <span className="text-sm font-black text-blue-600 font-mono">{testResult.apiVersion}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Tipo de Token</span>
                      <span className="text-xs font-bold text-slate-800">{testResult.tokenType}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Expiração</span>
                      <span className="text-xs font-bold text-emerald-700">Permanente</span>
                    </div>
                  </div>

                  {/* Scopes Verified */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      Escopos Ativos Detectados ({testResult.scopesFound.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {testResult.scopesFound.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Fechar Diagnóstico
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SINCRONIZAR PÁGINAS E ATIVOS */}
      {/* ========================================================================= */}
      {isSyncModalOpen && syncTargetApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-[#1A1D21]">
                  Sincronizar Páginas & Instagram
                </h3>
              </div>
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Deseja sincronizar as Páginas do Facebook e Contas de Instagram Business vinculadas ao App <strong>"{syncTargetApp.name}"</strong> (ID: <code className="font-mono text-blue-600">{syncTargetApp.appId}</code>)?
              </p>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1 text-[11px] text-blue-900">
                <span className="font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-blue-600" />
                  Como funciona:
                </span>
                <p>
                  O ManyFlow consultará o endpoint <code className="font-mono">/me/accounts</code> da Meta para listar e inscrever automaticamente suas páginas nos eventos de webhook.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSyncModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleSyncPages}
                  disabled={isTestingLoading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingLoading ? 'animate-spin' : ''}`} />
                  <span>{isTestingLoading ? 'Sincronizando...' : 'Iniciar Sincronização'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
