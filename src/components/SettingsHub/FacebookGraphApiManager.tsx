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
  Globe,
  Send,
  Code2,
  Clock,
  KeyRound,
  Shield,
  FileCode,
  Terminal,
  AlertTriangle,
  Play
} from 'lucide-react';
import { 
  FacebookPageLinkItem, 
  FacebookGraphTokenDebugResult, 
  FacebookGraphPermissionDef,
  FacebookApp
} from '../../types';
import { 
  facebookGraphApiService, 
  GRAPH_PERMISSIONS_CATALOG,
  INITIAL_LINKED_PAGES
} from '../../services/facebookGraphApiService';
import { facebookAppsService } from '../../services/facebookAppsService';
import { useAuth } from '../../context/AuthContext';

export const FacebookGraphApiManager: React.FC = () => {
  const { tenant } = useAuth();
  const tenantId = tenant?.id || 'tenant_main';

  // Sub-navigation tabs
  const [activeTab, setActiveTab] = useState<'pages' | 'permissions' | 'tokens' | 'playground' | 'guide'>('pages');

  // Main state
  const [pages, setPages] = useState<FacebookPageLinkItem[]>([]);
  const [apps, setApps] = useState<FacebookApp[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Search & Filter state for pages
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal: Link Page
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [linkMode, setLinkMode] = useState<'manual' | 'user_token'>('manual');
  const [isLinkingLoading, setIsLinkingLoading] = useState<boolean>(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);

  // Form for linking page
  const [pageForm, setPageForm] = useState<{
    id: string;
    name: string;
    category: string;
    pageAccessToken: string;
    isTokenPermanent: boolean;
    tokenExpiresAt: string;
    instagramBusinessId: string;
    instagramUsername: string;
    appId: string;
    subscribedFields: string[];
  }>({
    id: '',
    name: '',
    category: 'Empresa / Negócio Local',
    pageAccessToken: '',
    isTokenPermanent: true,
    tokenExpiresAt: 'never',
    instagramBusinessId: '',
    instagramUsername: '',
    appId: '',
    subscribedFields: ['messages', 'messaging_postbacks', 'message_deliveries', 'message_reads', 'message_reactions', 'feed']
  });

  // User Token Page Discovery
  const [discoveryUserToken, setDiscoveryUserToken] = useState<string>('');
  const [discoveredPages, setDiscoveredPages] = useState<any[]>([]);
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);

  // Modal: Live Test Page
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [testingPage, setTestingPage] = useState<FacebookPageLinkItem | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // Tokens Tab State: Long-Lived Token Exchange
  const [exchangeAppId, setExchangeAppId] = useState<string>('');
  const [exchangeAppSecret, setExchangeAppSecret] = useState<string>('');
  const [exchangeShortToken, setExchangeShortToken] = useState<string>('');
  const [isExchanging, setIsExchanging] = useState<boolean>(false);
  const [exchangeResult, setExchangeResult] = useState<any | null>(null);
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState<boolean>(false);

  // Tokens Tab State: Token Debugger
  const [debugInputToken, setDebugInputToken] = useState<string>('');
  const [isDebugging, setIsDebugging] = useState<boolean>(false);
  const [debugResult, setDebugResult] = useState<FacebookGraphTokenDebugResult | null>(null);

  // Permissions Tab State
  const [permissionsSearch, setPermissionsSearch] = useState<string>('');
  const [permissionCategory, setPermissionCategory] = useState<string>('all');
  const [inspectorToken, setInspectorToken] = useState<string>('');
  const [inspectedScopes, setInspectedScopes] = useState<string[]>([]);
  const [isInspectingScopes, setIsInspectingScopes] = useState<boolean>(false);

  // Playground Tab State
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState<string>('me_accounts');
  const [playgroundCustomUrl, setPlaygroundCustomUrl] = useState<string>('https://graph.facebook.com/v21.0/me/accounts?fields=id,name,category,access_token');
  const [playgroundToken, setPlaygroundToken] = useState<string>('');
  const [playgroundMethod, setPlaygroundMethod] = useState<'GET' | 'POST'>('GET');
  const [playgroundBody, setPlaygroundBody] = useState<string>('');
  const [isExecutingPlayground, setIsExecutingPlayground] = useState<boolean>(false);
  const [playgroundResponse, setPlaygroundResponse] = useState<any | null>(null);

  // Load Data
  useEffect(() => {
    loadInitialData();
  }, [tenantId]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [fetchedPages, fetchedApps] = await Promise.all([
        facebookGraphApiService.getPages(tenantId),
        facebookAppsService.getApps(tenantId)
      ]);
      setPages(fetchedPages);
      setApps(fetchedApps);
      if (fetchedApps.length > 0) {
        const defaultApp = fetchedApps.find(a => a.isDefault) || fetchedApps[0];
        setSelectedAppId(defaultApp.appId);
        setExchangeAppId(defaultApp.appId);
        setExchangeAppSecret(defaultApp.appSecret || '');
        setPageForm(prev => ({ ...prev, appId: defaultApp.appId }));
      }
    } catch (err) {
      console.error('Erro ao carregar dados do Graph API Manager:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Handler: Open Link Modal
  const handleOpenLinkModal = () => {
    setLinkError(null);
    setLinkSuccess(null);
    setDiscoveredPages([]);
    setDiscoveryUserToken('');
    setPageForm({
      id: '',
      name: '',
      category: 'Empresa / Negócio Local',
      pageAccessToken: '',
      isTokenPermanent: true,
      tokenExpiresAt: 'never',
      instagramBusinessId: '',
      instagramUsername: '',
      appId: selectedAppId || (apps[0]?.appId || '982736154819203'),
      subscribedFields: ['messages', 'messaging_postbacks', 'message_deliveries', 'message_reads', 'message_reactions', 'feed']
    });
    setIsLinkModalOpen(true);
  };

  // Handler: Submit Link Page
  const handleSubmitLinkPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageForm.id.trim() || !pageForm.name.trim()) {
      setLinkError('Por favor, informe o Page ID e o Nome da Página.');
      return;
    }
    if (!pageForm.pageAccessToken.trim()) {
      setLinkError('O Page Access Token é obrigatório para autenticação na Graph API.');
      return;
    }

    setIsLinkingLoading(true);
    setLinkError(null);

    try {
      const created = await facebookGraphApiService.linkPage({
        id: pageForm.id.trim(),
        name: pageForm.name.trim(),
        category: pageForm.category.trim(),
        pageAccessToken: pageForm.pageAccessToken.trim(),
        isTokenPermanent: pageForm.isTokenPermanent,
        tokenExpiresAt: pageForm.isTokenPermanent ? 'never' : pageForm.tokenExpiresAt,
        appId: pageForm.appId,
        instagramBusinessId: pageForm.instagramBusinessId.trim() || undefined,
        instagramUsername: pageForm.instagramUsername.trim() || undefined,
        subscribedFields: pageForm.subscribedFields,
        tenantId
      });

      setPages(prev => {
        const filtered = prev.filter(p => p.id !== created.id);
        return [created, ...filtered];
      });

      setLinkSuccess(`Página "${created.name}" vinculada com sucesso!`);
      setTimeout(() => {
        setIsLinkModalOpen(false);
      }, 1200);
    } catch (err: any) {
      setLinkError(err.message || 'Erro ao vincular página na Graph API.');
    } finally {
      setIsLinkingLoading(false);
    }
  };

  // Handler: Discover Pages with User Token
  const handleDiscoverPages = async () => {
    if (!discoveryUserToken.trim()) {
      setLinkError('Cole um User Access Token válido com a permissão "pages_show_list" para buscar as páginas.');
      return;
    }
    setIsDiscovering(true);
    setLinkError(null);

    try {
      await new Promise(r => setTimeout(r, 600));
      const sampleDiscovered = [
        {
          id: '309817264519201',
          name: 'ManyFlow Suporte & Atendimento',
          category: 'Centro de Atendimento',
          followersCount: 8400,
          pageAccessToken: `EAABwzLIX4NkBA${Math.random().toString(36).substr(2, 10)}...disc_page_token`,
          instagramBusinessId: '178414099882211',
          instagramUsername: '@manyflow.suporte',
          tasks: ['MANAGE', 'MESSAGING']
        },
        {
          id: '409182736451928',
          name: 'Agência Digital & Performance',
          category: 'Agência de Marketing',
          followersCount: 15600,
          pageAccessToken: `EAABwzLIX4NkBA${Math.random().toString(36).substr(2, 10)}...disc_page_token_2`,
          instagramBusinessId: '',
          instagramUsername: '',
          tasks: ['MANAGE', 'MESSAGING']
        }
      ];
      setDiscoveredPages(sampleDiscovered);
    } catch (err: any) {
      setLinkError(err.message || 'Erro ao consultar Graph API /me/accounts.');
    } finally {
      setIsDiscovering(false);
    }
  };

  // Handler: Select Discovered Page
  const handleSelectDiscoveredPage = (disc: any) => {
    setPageForm(prev => ({
      ...prev,
      id: disc.id,
      name: disc.name,
      category: disc.category,
      pageAccessToken: disc.pageAccessToken,
      instagramBusinessId: disc.instagramBusinessId || '',
      instagramUsername: disc.instagramUsername || '',
      isTokenPermanent: true,
      tokenExpiresAt: 'never'
    }));
    setLinkMode('manual');
  };

  // Handler: Test Page Connection
  const handleTestPage = async (page: FacebookPageLinkItem) => {
    setTestingPage(page);
    setIsTestModalOpen(true);
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await facebookGraphApiService.testPageConnection(page);
      setTestResult(result);
      // Update in state
      setPages(prev => prev.map(p => p.id === page.id ? { ...p, lastTestResult: result as any } : p));
    } catch (err: any) {
      setTestResult({
        success: false,
        latencyMs: 0,
        statusCode: 500,
        message: err.message || 'Falha ao testar conexão com a Graph API.',
        details: {}
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Handler: Subscribe Webhook for page
  const handleSubscribeWebhook = async (pageId: string) => {
    try {
      await facebookGraphApiService.subscribePageWebhook(pageId);
      setPages(prev => prev.map(p => p.id === pageId ? { ...p, isWebhookSubscribed: true } : p));
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Unlink Page
  const handleUnlinkPage = async (pageId: string, pageName: string) => {
    if (!window.confirm(`Tem certeza que deseja desvincular a página "${pageName}"? As automações de mensagens para este canal serão pausadas.`)) {
      return;
    }
    await facebookGraphApiService.unlinkPage(pageId);
    setPages(prev => prev.filter(p => p.id !== pageId));
  };

  // Handler: Exchange to Long-Lived Token
  const handleExchangeToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exchangeShortToken.trim()) {
      setExchangeError('Informe o Short-Lived User Token gerado no Graph API Explorer.');
      return;
    }
    if (!exchangeAppId.trim() || !exchangeAppSecret.trim()) {
      setExchangeError('App ID e App Secret são necessários para a troca de token oauth/access_token.');
      return;
    }

    setIsExchanging(true);
    setExchangeError(null);
    setExchangeResult(null);

    try {
      const res = await facebookGraphApiService.exchangeToLongLivedToken({
        appId: exchangeAppId.trim(),
        appSecret: exchangeAppSecret.trim(),
        shortLivedUserToken: exchangeShortToken.trim()
      });
      if (res.success) {
        setExchangeResult(res);
      } else {
        setExchangeError(res.error || 'Erro na troca de token.');
      }
    } catch (err: any) {
      setExchangeError(err.message || 'Erro inesperado na Graph API.');
    } finally {
      setIsExchanging(false);
    }
  };

  // Handler: Debug Token
  const handleDebugToken = async () => {
    if (!debugInputToken.trim()) return;
    setIsDebugging(true);
    try {
      const res = await facebookGraphApiService.debugToken(debugInputToken.trim(), selectedAppId);
      setDebugResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDebugging(false);
    }
  };

  // Handler: Inspect Scopes from Token
  const handleInspectScopes = async () => {
    if (!inspectorToken.trim()) return;
    setIsInspectingScopes(true);
    try {
      const res = await facebookGraphApiService.debugToken(inspectorToken.trim(), selectedAppId);
      if (res.isValid && res.scopes) {
        setInspectedScopes(res.scopes);
      } else {
        setInspectedScopes([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsInspectingScopes(false);
    }
  };

  // Handler: Execute Playground Request
  const handleExecutePlayground = async () => {
    setIsExecutingPlayground(true);
    setPlaygroundResponse(null);
    const startTime = Date.now();

    try {
      await new Promise(r => setTimeout(r, 450 + Math.random() * 300));
      const durationMs = Date.now() - startTime;

      let mockData: any;
      if (playgroundEndpoint === 'me_accounts') {
        mockData = {
          data: pages.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            tasks: p.tasks,
            access_token: p.pageAccessToken.substring(0, 20) + '...',
            instagram_business_account: p.instagramBusinessId ? { id: p.instagramBusinessId } : undefined
          })),
          paging: {
            cursors: { before: 'QVFIU...', after: 'QVFIU...' }
          }
        };
      } else if (playgroundEndpoint === 'page_details') {
        const activeP = pages[0] || INITIAL_LINKED_PAGES[0];
        mockData = {
          id: activeP.id,
          name: activeP.name,
          category: activeP.category,
          followers_count: activeP.followersCount,
          instagram_business_account: {
            id: activeP.instagramBusinessId || '17841401928374619',
            username: activeP.instagramUsername || 'manyflow.oficial'
          }
        };
      } else if (playgroundEndpoint === 'subscribed_apps') {
        mockData = {
          success: true,
          subscribed_fields: ['messages', 'messaging_postbacks', 'message_deliveries', 'message_reads', 'message_reactions', 'feed']
        };
      } else {
        mockData = {
          recipient_id: '10982348192837',
          message_id: `mid.$${Math.random().toString(36).substr(2, 12)}`
        };
      }

      setPlaygroundResponse({
        status: 200,
        statusText: 'OK',
        durationMs,
        headers: {
          'content-type': 'application/json; charset=UTF-8',
          'facebook-api-version': 'v21.0',
          'x-business-use-case-usage': '{"982736154819203":[{"type":"pages_messaging","call_count":1,"total_cputime":1,"total_time":1,"estimated_time_to_reset_overage":0}]}',
          'x-fb-trace-id': `GZ${Math.random().toString(36).substr(2, 8).toUpperCase()}`
        },
        body: mockData
      });
    } catch (err: any) {
      setPlaygroundResponse({
        status: 500,
        statusText: 'Internal Error',
        durationMs: 0,
        body: { error: { message: err.message || 'Erro na requisição' } }
      });
    } finally {
      setIsExecutingPlayground(false);
    }
  };

  // Filtered pages
  const filteredPages = pages.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.includes(searchQuery) ||
      (p.instagramUsername && p.instagramUsername.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'permanent') return p.isTokenPermanent;
    if (statusFilter === 'instagram') return Boolean(p.instagramBusinessId);
    if (statusFilter === 'webhook') return p.isWebhookSubscribed;
    return true;
  });

  // Filtered permissions
  const filteredPermissions = GRAPH_PERMISSIONS_CATALOG.filter(perm => {
    const matchesCat = permissionCategory === 'all' || perm.category === permissionCategory;
    const matchesQuery = perm.name.toLowerCase().includes(permissionsSearch.toLowerCase()) ||
      perm.scope.toLowerCase().includes(permissionsSearch.toLowerCase()) ||
      perm.description.toLowerCase().includes(permissionsSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const totalPermanentTokens = pages.filter(p => p.isTokenPermanent).length;
  const totalInstagramLinked = pages.filter(p => p.instagramBusinessId).length;
  const totalWebhooksActive = pages.filter(p => p.isWebhookSubscribed).length;

  return (
    <div id="facebook_graph_api_manager" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Overview */}
      <div className="bg-gradient-to-br from-[#0B1E3D] via-[#102C57] to-[#1E3E62] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-blue-900/60">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-black tracking-wide flex items-center gap-1.5 shadow-xs">
                <Facebook className="w-3.5 h-3.5 fill-current" />
                <span>Meta Graph API v21.0</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Motor de Páginas & Tokens Ativo</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-[10px] font-bold">
                Long-Lived & System Users
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Integração Facebook Graph API & Gestão de Páginas
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
              Vincule Páginas do Facebook, gerencie permissões granulares de acesso (Messenger & Instagram Direct), renove tokens de 60 dias ou configure tokens permanentes sem expiração.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 backdrop-blur-md p-3.5 rounded-xl border border-white/10 shrink-0">
            <div className="p-2.5 rounded-lg bg-black/20 text-center">
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">Páginas</span>
              <span className="text-xl font-black text-white">{pages.length}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/20 text-center">
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">Tokens Perm.</span>
              <span className="text-xl font-black text-emerald-300">{totalPermanentTokens}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/20 text-center">
              <span className="text-[10px] font-bold text-pink-200 uppercase tracking-wider block">Instagram</span>
              <span className="text-xl font-black text-pink-300">{totalInstagramLinked}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/20 text-center">
              <span className="text-[10px] font-bold text-sky-200 uppercase tracking-wider block">Webhooks</span>
              <span className="text-xl font-black text-sky-300">{totalWebhooksActive}</span>
            </div>
          </div>
        </div>

        {/* Sub-nav Tabs Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-6 mt-4 border-t border-white/10">
          <button
            onClick={() => setActiveTab('pages')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'pages'
                ? 'bg-white text-[#102C57] shadow-md font-extrabold'
                : 'text-blue-100/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Facebook className="w-3.5 h-3.5" />
            <span>Páginas Vinculadas ({pages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'permissions'
                ? 'bg-white text-[#102C57] shadow-md font-extrabold'
                : 'text-blue-100/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Permissões & Escopos (Scopes)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
              {GRAPH_PERMISSIONS_CATALOG.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tokens')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'tokens'
                ? 'bg-white text-[#102C57] shadow-md font-extrabold'
                : 'text-blue-100/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
            <span>Tokens de Longa Duração & Debugger</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-100 text-amber-900">
              60d / Perm
            </span>
          </button>

          <button
            onClick={() => setActiveTab('playground')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'playground'
                ? 'bg-white text-[#102C57] shadow-md font-extrabold'
                : 'text-blue-100/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>Testador de Endpoints (Playground)</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-white text-[#102C57] shadow-md font-extrabold'
                : 'text-blue-100/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>Guia Passo a Passo</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PÁGINAS VINCULADAS (LINKED FACEBOOK PAGES)                         */}
      {/* ========================================================================= */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por nome da página, ID ou Instagram..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="all">Todos os Status</option>
                <option value="permanent">Tokens Permanentes</option>
                <option value="instagram">Com Instagram Vinculado</option>
                <option value="webhook">Com Webhook Subscrito</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadInitialData}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Recarregar páginas"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleOpenLinkModal}
                className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Vincular Nova Página</span>
              </button>
            </div>
          </div>

          {/* Pages Grid */}
          {filteredPages.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                <Facebook className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Nenhuma Página Encontrada
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {searchQuery
                    ? 'Nenhuma página corresponde aos termos da busca. Tente outro filtro.'
                    : 'Vincule sua primeira Página do Facebook para ativar automações no Messenger e Instagram Direct.'}
                </p>
              </div>
              <button
                onClick={handleOpenLinkModal}
                className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Vincular Página do Facebook</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredPages.map((page) => {
                const isPermanent = page.isTokenPermanent || page.tokenExpiresAt === 'never';
                return (
                  <div
                    key={page.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4 relative"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={page.avatarUrl}
                          alt={page.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500/20 shadow-xs shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {page.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {page.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                            <span>ID: {page.id}</span>
                            <button
                              onClick={() => copyToClipboard(page.id, `id_${page.id}`)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                              title="Copiar ID da Página"
                            >
                              {copiedKey === `id_${page.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTestPage(page)}
                          className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-300 transition-colors cursor-pointer"
                          title="Testar Conexão em Tempo Real na Graph API"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUnlinkPage(page.id, page.name)}
                          className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Desvincular Página"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata & Status badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                      {/* Token Expiry Status */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-amber-500" />
                          <span>Status do Token</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isPermanent ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              Permanente (Sem Expiração)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              60 Dias (Ativo)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Webhook Subscription */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Radio className="w-3 h-3 text-blue-500" />
                          <span>Webhook de Página</span>
                        </span>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            page.isWebhookSubscribed 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}>
                            {page.isWebhookSubscribed ? 'Sincronizado (Ativo)' : 'Pendente'}
                          </span>
                          {!page.isWebhookSubscribed && (
                            <button
                              onClick={() => handleSubscribeWebhook(page.id)}
                              className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                            >
                              Subscrever
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Instagram Business Account */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Instagram className="w-3 h-3 text-pink-500" />
                          <span>Instagram Direct</span>
                        </span>
                        <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                          {page.instagramUsername ? (
                            <span className="text-pink-600 dark:text-pink-400 font-extrabold">{page.instagramUsername}</span>
                          ) : (
                            <span className="text-slate-400 font-normal">Não vinculado</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Token & Subscribed Fields Peek */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">
                          Page Access Token (Graph API):
                        </span>
                        <button
                          onClick={() => copyToClipboard(page.pageAccessToken, `tok_${page.id}`)}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          {copiedKey === `tok_${page.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === `tok_${page.id}` ? 'Copiado!' : 'Copiar Token'}</span>
                        </button>
                      </div>
                      <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        {page.pageAccessToken.substring(0, 24)}••••••••••••••••{page.pageAccessToken.substring(page.pageAccessToken.length - 8)}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-400">Eventos Subscritos:</span>
                        {page.subscribedFields.map((field) => (
                          <span
                            key={field}
                            className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[9px] font-semibold"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Last test result badge if any */}
                    {page.lastTestResult && (
                      <div className={`p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 border ${
                        page.lastTestResult.success 
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/60' 
                          : 'bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800/60'
                      }`}>
                        <div className="flex items-center gap-1.5 truncate">
                          {page.lastTestResult.success ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          )}
                          <span className="truncate text-[11px] font-medium">{page.lastTestResult.message}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-white/80 dark:bg-black/40 px-2 py-0.5 rounded-full shrink-0">
                          ⚡ {page.lastTestResult.latencyMs}ms
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PERMISSÕES & ESCOPOS (PERMISSIONS & SCOPES MATRIX)                 */}
      {/* ========================================================================= */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {/* Inspector Tool Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Inspetor de Permissões em Tempo Real</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cole qualquer User Token, Page Token ou System User Token para validar quais permissões estão efetivamente concedidas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInspectorToken(pages[0]?.pageAccessToken || '');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Usar Token da Página 1
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Cole o Access Token (EAAB...) para inspecionar permissões..."
                value={inspectorToken}
                onChange={(e) => setInspectorToken(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleInspectScopes}
                disabled={isInspectingScopes || !inspectorToken.trim()}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all shrink-0"
              >
                {isInspectingScopes ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>Inspecionar Escopos</span>
              </button>
            </div>

            {inspectedScopes.length > 0 && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                    {inspectedScopes.length} Permissões Ativas e Válidas no Token:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {inspectedScopes.map(scope => (
                    <span
                      key={scope}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] font-bold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 shadow-2xs"
                    >
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>{scope}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Permissions Matrix & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filtrar permissão por nome ou escopo..."
                  value={permissionsSearch}
                  onChange={(e) => setPermissionsSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {['all', 'messaging', 'instagram', 'pages', 'business'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPermissionCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer capitalize ${
                      permissionCategory === cat
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'Todas' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 px-3">Escopo & Permissão</th>
                    <th className="pb-3 px-3">Categoria</th>
                    <th className="pb-3 px-3">Descrição & Finalidade</th>
                    <th className="pb-3 px-3">Recursos Dependentes</th>
                    <th className="pb-3 px-3 text-center">App Review</th>
                    <th className="pb-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredPermissions.map((perm) => (
                    <tr key={perm.scope} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-slate-900 dark:text-white block">
                            {perm.name}
                          </span>
                          <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900 inline-block">
                            {perm.scope}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          {perm.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                          {perm.description}
                        </p>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {perm.requiredFor.map(req => (
                            <span key={req} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
                              {req}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {perm.requiresAppReview ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                            Requer Review
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Uso Padrão
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Concedida</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TOKENS DE LONGA DURAÇÃO & DEBUGGER                                */}
      {/* ========================================================================= */}
      {activeTab === 'tokens' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Long-Lived Token Exchange Form */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>Gerador de Token de Longa Duração (60 Dias / Permanente)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Troque um token curto (1-2h gerado no Graph Explorer) por um token de usuário de 60 dias ou obtenha um Page Access Token permanente.
              </p>
            </div>

            <form onSubmit={handleExchangeToken} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Meta App ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="982736154819203"
                    value={exchangeAppId}
                    onChange={(e) => setExchangeAppId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">App Secret (Chave Secreta) *</label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      required
                      placeholder="a8f9b2c3d4e5f6..."
                      value={exchangeAppSecret}
                      onChange={(e) => setExchangeAppSecret(e.target.value)}
                      className="w-full px-3 py-2 pr-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                    >
                      {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Short-Lived User Token (Token Curto 1-2h) *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Cole aqui o token de usuário gerado no Meta Graph API Explorer (EAABwz...)"
                  value={exchangeShortToken}
                  onChange={(e) => setExchangeShortToken(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {exchangeError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{exchangeError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isExchanging}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
              >
                {isExchanging ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Convertendo via Graph API...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Converter em Token de Longa Duração & Obter Page Token</span>
                  </>
                )}
              </button>
            </form>

            {/* Exchange Result Box */}
            {exchangeResult && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tokens Gerados com Sucesso!</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                    HTTP 200 OK
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span>Page Access Token Permanente:</span>
                      <button
                        onClick={() => copyToClipboard(exchangeResult.pageAccessToken, 'res_page_tok')}
                        className="text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        {copiedKey === 'res_page_tok' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copiar</span>
                      </button>
                    </div>
                    <pre className="text-[10px] font-mono bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200 break-all whitespace-pre-wrap">
                      {exchangeResult.pageAccessToken}
                    </pre>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span>Long-Lived User Token (60 Dias):</span>
                      <button
                        onClick={() => copyToClipboard(exchangeResult.longLivedUserToken, 'res_user_tok')}
                        className="text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        {copiedKey === 'res_user_tok' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copiar</span>
                      </button>
                    </div>
                    <pre className="text-[10px] font-mono bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200 break-all whitespace-pre-wrap">
                      {exchangeResult.longLivedUserToken}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Token Debugger & Inspector */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>Depurador de Tokens (Meta Token Debugger)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspecione o tipo de token, validade exata, ID de aplicativo associado e escopos granularmente concedidos.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Access Token para Depuração</label>
                <textarea
                  rows={3}
                  placeholder="Cole qualquer token (Page, User ou System User) para validar..."
                  value={debugInputToken}
                  onChange={(e) => setDebugInputToken(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDebugInputToken(pages[0]?.pageAccessToken || '')}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Carregar Token da Página 1
                </button>
                <button
                  type="button"
                  onClick={handleDebugToken}
                  disabled={isDebugging || !debugInputToken.trim()}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                >
                  {isDebugging ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Validar e Inspecionar Token</span>
                </button>
              </div>
            </div>

            {/* Debug Result Card */}
            {debugResult && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    {debugResult.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    )}
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {debugResult.isValid ? 'Token Válido e Ativo' : 'Token Inválido'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
                    {debugResult.tokenType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block">App ID Associado</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{debugResult.appId}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block">Expiração</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {debugResult.isPermanent ? 'Permanente (Never Expire)' : 'Ativo (60 Dias)'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Escopos Concedidos no Token ({debugResult.scopes.length}):
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                    {debugResult.scopes.map(scope => (
                      <span key={scope} className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[9px] font-bold">
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TESTADOR DE ENDPOINTS (PLAYGROUND)                                 */}
      {/* ========================================================================= */}
      {activeTab === 'playground' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-500" />
              <span>Playground Interativo da Meta Graph API v21.0</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simule e execute chamadas reais da Graph API para validar envio de mensagens, listagem de contas e subscrições de webhooks.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Request Form */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Preset de Chamada</label>
                <select
                  value={playgroundEndpoint}
                  onChange={(e) => {
                    setPlaygroundEndpoint(e.target.value);
                    if (e.target.value === 'me_accounts') {
                      setPlaygroundMethod('GET');
                      setPlaygroundCustomUrl('https://graph.facebook.com/v21.0/me/accounts?fields=id,name,category,access_token');
                    } else if (e.target.value === 'page_details') {
                      setPlaygroundMethod('GET');
                      setPlaygroundCustomUrl(`https://graph.facebook.com/v21.0/${pages[0]?.id || '109823481920041'}?fields=id,name,category,followers_count,instagram_business_account`);
                    } else if (e.target.value === 'subscribed_apps') {
                      setPlaygroundMethod('POST');
                      setPlaygroundCustomUrl(`https://graph.facebook.com/v21.0/${pages[0]?.id || '109823481920041'}/subscribed_apps?subscribed_fields=messages,messaging_postbacks`);
                    } else if (e.target.value === 'send_message') {
                      setPlaygroundMethod('POST');
                      setPlaygroundCustomUrl(`https://graph.facebook.com/v21.0/${pages[0]?.id || '109823481920041'}/messages`);
                      setPlaygroundBody(JSON.stringify({
                        recipient: { id: "USER_PSID_HERE" },
                        message: { text: "Olá! Esta é uma resposta automática do ManyFlow." }
                      }, null, 2));
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="me_accounts">GET /me/accounts (Listar Páginas Gerenciadas)</option>
                  <option value="page_details">GET /{'{page-id}'} (Metadados da Página & Instagram)</option>
                  <option value="subscribed_apps">POST /{'{page-id}'}/subscribed_apps (Subscrever Webhook)</option>
                  <option value="send_message">POST /{'{page-id}'}/messages (Envio de Mensagem Messenger)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">URL do Endpoint Graph API</label>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-black text-blue-600">
                    {playgroundMethod}
                  </span>
                  <input
                    type="text"
                    value={playgroundCustomUrl}
                    onChange={(e) => setPlaygroundCustomUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {playgroundMethod === 'POST' && playgroundBody && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Payload JSON (Body)</label>
                  <textarea
                    rows={4}
                    value={playgroundBody}
                    onChange={(e) => setPlaygroundBody(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleExecutePlayground}
                disabled={isExecutingPlayground}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
              >
                {isExecutingPlayground ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>Executar Chamada Graph API</span>
              </button>
            </div>

            {/* Right Column: Response Viewer */}
            <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-4 border border-slate-800 text-white space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">Resposta da Graph API</span>
                    {playgroundResponse && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        HTTP {playgroundResponse.status} {playgroundResponse.statusText}
                      </span>
                    )}
                    {playgroundResponse?.durationMs !== undefined && (
                      <span className="text-[10px] font-mono text-blue-400">
                        ⚡ {playgroundResponse.durationMs}ms
                      </span>
                    )}
                  </div>

                  {playgroundResponse && (
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(playgroundResponse.body, null, 2), 'play_res')}
                      className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'play_res' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'play_res' ? 'Copiado' : 'Copiar JSON'}</span>
                    </button>
                  )}
                </div>

                <pre className="text-[11px] font-mono text-emerald-400 bg-black/50 p-3.5 rounded-xl max-h-72 overflow-y-auto whitespace-pre-wrap leading-tight">
                  {playgroundResponse
                    ? JSON.stringify(playgroundResponse.body, null, 2)
                    : '// Clique em "Executar Chamada Graph API" para inspecionar a resposta.'}
                </pre>
              </div>

              <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                <span>Versão Ativa: Graph API v21.0</span>
                <span>Content-Type: application/json</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: GUIA PASSO A PASSO OFICIAL                                         */}
      {/* ========================================================================= */}
      {activeTab === 'guide' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-500" />
              <span>Guia Oficial de Configuração no Meta for Developers</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Siga os 4 passos essenciais para conectar qualquer Página do Facebook e gerar tokens permanentes do Usuário do Sistema.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">1</span>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Criar App no Meta Developers</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Acesse developers.facebook.com, crie um App do tipo "Empresarial" (Business) e adicione o produto "Messenger" e "Instagram Graph API".
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">2</span>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Vincular a Página ao App</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                No menu Messenger &gt; Configurações do App, adicione sua Página do Facebook e gere o Page Access Token inicial.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 space-y-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center">3</span>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Gerar Token Permanente</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                No Meta Business Suite &gt; Configurações do Negócio &gt; Usuários do Sistema, crie um System User Admin e gere um token permanente sem expiração.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">4</span>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Subscrever Webhooks</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Cole a URL de Callback do ManyFlow e subscreva a página aos campos "messages", "messaging_postbacks" e "feed".
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VINCULAR PÁGINA DO FACEBOOK                                        */}
      {/* ========================================================================= */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 border border-blue-200 dark:border-blue-800">
                  <Facebook className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Vincular Página do Facebook
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Conecte a página para habilitar disparos, inbox e automações de fluxo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setLinkMode('manual')}
                className={`py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  linkMode === 'manual'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                1. Vinculação Direta (Page ID + Token)
              </button>
              <button
                type="button"
                onClick={() => setLinkMode('user_token')}
                className={`py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  linkMode === 'user_token'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                2. Assistente com User Token (/me/accounts)
              </button>
            </div>

            {/* Mode 2: User Token Discovery */}
            {linkMode === 'user_token' && (
              <div className="space-y-4 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    User Access Token com permissão "pages_show_list"
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Cole aqui o User Token gerado no Graph API Explorer..."
                      value={discoveryUserToken}
                      onChange={(e) => setDiscoveryUserToken(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleDiscoverPages}
                      disabled={isDiscovering || !discoveryUserToken.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                    >
                      {isDiscovering ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      <span>Buscar</span>
                    </button>
                  </div>
                </div>

                {discoveredPages.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                      Páginas encontradas na sua conta:
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {discoveredPages.map(disc => (
                        <div
                          key={disc.id}
                          className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 hover:border-blue-500 transition-colors"
                        >
                          <div className="truncate">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white block truncate">{disc.name}</span>
                            <span className="text-[10px] font-mono text-slate-500">ID: {disc.id} • {disc.category}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectDiscoveredPage(disc)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 text-blue-600 hover:text-white font-bold text-xs cursor-pointer transition-colors"
                          >
                            Selecionar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manual Form */}
            <form onSubmit={handleSubmitLinkPage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Facebook Page ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 109823481920041"
                    value={pageForm.id}
                    onChange={(e) => setPageForm({ ...pageForm, id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nome Oficial da Página *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Minha Empresa Oficial"
                    value={pageForm.name}
                    onChange={(e) => setPageForm({ ...pageForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Page Access Token (Token de Acesso da Página) *
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold">Permanente ou 60 dias</span>
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder="Cole aqui o Page Access Token gerado no Graph API Explorer ou System User..."
                  value={pageForm.pageAccessToken}
                  onChange={(e) => setPageForm({ ...pageForm, pageAccessToken: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Instagram Business Username (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: @empresa.oficial"
                    value={pageForm.instagramUsername}
                    onChange={(e) => setPageForm({ ...pageForm, instagramUsername: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tipo de Expiração</label>
                  <select
                    value={pageForm.isTokenPermanent ? 'permanent' : '60d'}
                    onChange={(e) => setPageForm({ ...pageForm, isTokenPermanent: e.target.value === 'permanent' })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                  >
                    <option value="permanent">Token Permanente (System User - Recomendado)</option>
                    <option value="60d">Token de Longa Duração (60 Dias)</option>
                  </select>
                </div>
              </div>

              {linkError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{linkError}</span>
                </div>
              )}

              {linkSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{linkSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLinkingLoading}
                  className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isLinkingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Salvar e Vincular Página</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LIVE TEST MODAL                                                    */}
      {/* ========================================================================= */}
      {isTestModalOpen && testingPage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Diagnóstico em Tempo Real: {testingPage.name}
                </h3>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isTesting ? (
              <div className="p-8 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Enviando ping de autenticação para a Meta Graph API v21.0...
                </p>
                <p className="text-[10px] font-mono text-slate-400">
                  GET /{testingPage.id}?fields=id,name,category,access_token
                </p>
              </div>
            ) : testResult ? (
              <div className="space-y-4 animate-in fade-in">
                <div className={`p-4 rounded-2xl border ${
                  testResult.success 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}>
                  <div className="flex items-center justify-between pb-2 border-b border-current/20">
                    <div className="flex items-center gap-2 font-black text-xs">
                      {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                      <span>{testResult.success ? 'Conexão Bem-Sucedida' : 'Falha na Autenticação'}</span>
                    </div>
                    <span className="font-mono text-[10px] bg-white/80 dark:bg-black/40 px-2 py-0.5 rounded-full border border-current">
                      HTTP {testResult.statusCode} ({testResult.latencyMs}ms)
                    </span>
                  </div>
                  <p className="text-xs pt-2 leading-relaxed font-medium">
                    {testResult.message}
                  </p>
                </div>

                {testResult.details && (
                  <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 font-medium">Page ID Oficial:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{testingPage.id}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 font-medium">Status do Token:</span>
                      <span className="font-bold text-emerald-600">{testResult.details.tokenExpiryText}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 font-medium">Webhook Subscrito:</span>
                      <span className="font-bold text-blue-600">{testResult.details.isWebhookSubscribed ? 'Sim (messages, feed)' : 'Não'}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="py-2 px-5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs cursor-pointer hover:opacity-90"
              >
                Fechar Diagnóstico
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
