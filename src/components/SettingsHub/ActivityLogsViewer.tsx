import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  User as UserIcon,
  Shield,
  Zap,
  Send,
  Webhook,
  Users,
  Facebook,
  Sparkles,
  Settings,
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Clock,
  Globe,
  ExternalLink,
  ChevronRight,
  Eye,
  FileJson,
  PlusCircle,
  Copy,
  Check,
  Code
} from 'lucide-react';
import { ActivityLog, ActivityLogCategory, ActivityLogStatus } from '../../types';

export const ActivityLogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initial mock logs to display if backend is empty
  const initialFallbackLogs: ActivityLog[] = [];

  const fetchLogs = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/activity-logs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLogs(data);
        } else {
          setLogs(initialFallbackLogs);
        }
      } else {
        setLogs(initialFallbackLogs);
      }
    } catch (err) {
      console.warn('Usando logs locais de fallback:', err);
      setLogs(initialFallbackLogs);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      fetchLogs();
    }, 12000);
    return () => clearInterval(timer);
  }, [autoRefresh]);

  const handleSimulateNewAction = async () => {
    const sampleActions = [
      {
        category: 'flow' as ActivityLogCategory,
        action: 'flow.node_added',
        title: 'Adicionou Nó de Mensagem com Variação A/B',
        description: 'Criou mensagem promocional alternativa com 60% de tráfego alocado no fluxo de Black Friday.',
        entityType: 'flow' as const,
        entityName: 'Fluxo Black Friday 2026',
        status: 'success' as ActivityLogStatus
      },
      {
        category: 'broadcast' as ActivityLogCategory,
        action: 'broadcast.scheduled',
        title: 'Agendou Disparo em Massa para Amanhã às 09:00',
        description: 'Campanha de Reengajamento programada para 1.180 contatos com tag "Lead-Frio".',
        entityType: 'broadcast' as const,
        entityName: 'Disparo Reengajamento Seguidos',
        status: 'info' as ActivityLogStatus
      },
      {
        category: 'webhook' as ActivityLogCategory,
        action: 'webhook.test_sent',
        title: 'Disparo de Teste Realizado com Sucesso (200 OK)',
        description: 'Endpoint https://api.crm-parceiro.com/webhooks testado com latência de 142ms.',
        entityType: 'webhook' as const,
        entityName: 'Webhook CRM Parceiro',
        status: 'success' as ActivityLogStatus
      }
    ];

    const pick = sampleActions[Math.floor(Math.random() * sampleActions.length)];
    const newLog: ActivityLog = {
      id: `log_act_${Date.now()}`,
      userId: 'usr_super_1',
      userName: 'Administrador Principal',
      userEmail: 'admin@manyflow.com',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      userRole: 'Super Admin',
      tenantId: 'tenant_main',
      category: pick.category,
      action: pick.action,
      title: pick.title,
      description: pick.description,
      entityType: pick.entityType,
      entityName: pick.entityName,
      ipAddress: '187.54.120.45',
      userAgent: navigator.userAgent,
      status: pick.status,
      metadata: { simulated: true, timestamp: new Date().toISOString() },
      createdAt: new Date().toISOString()
    };

    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      });
    } catch {
      // ignore
    }

    setLogs((prev) => [newLog, ...prev]);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Data/Hora', 'Usuário', 'E-mail', 'Cargo', 'Categoria', 'Ação', 'Título', 'Descrição', 'Status', 'IP'];
    const rows = filteredLogs.map((l) => [
      l.id,
      new Date(l.createdAt).toLocaleString('pt-BR'),
      l.userName,
      l.userEmail,
      l.userRole || '',
      l.category,
      l.action,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      l.status,
      l.ipAddress || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `manyflow_activity_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `manyflow_activity_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === '' ||
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.entityName && log.entityName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.ipAddress && log.ipAddress.includes(searchQuery));

    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    const matchesUser = selectedUser === 'all' || log.userId === selectedUser;
    const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;

    let matchesDate = true;
    if (selectedDateRange === '24h') {
      const dayAgo = new Date(Date.now() - 24 * 3600 * 1000);
      matchesDate = new Date(log.createdAt) >= dayAgo;
    } else if (selectedDateRange === '7d') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
      matchesDate = new Date(log.createdAt) >= weekAgo;
    } else if (selectedDateRange === '30d') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
      matchesDate = new Date(log.createdAt) >= monthAgo;
    }

    return matchesSearch && matchesCategory && matchesUser && matchesStatus && matchesDate;
  });

  // Unique users list for filter
  const uniqueUsers: { id: string; name: string }[] = Array.from(
    new Set(logs.map((l) => JSON.stringify({ id: l.userId, name: l.userName })))
  ).map((s: string) => JSON.parse(s));

  const getCategoryBadge = (cat: ActivityLogCategory) => {
    switch (cat) {
      case 'flow':
        return { label: 'Fluxos', icon: Zap, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'broadcast':
        return { label: 'Broadcast', icon: Send, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'webhook':
        return { label: 'Webhooks', icon: Webhook, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'team':
        return { label: 'Equipe', icon: Users, bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
      case 'meta_app':
        return { label: 'Meta Apps', icon: Facebook, bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
      case 'ai_agent':
        return { label: 'Agente IA', icon: Sparkles, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
      case 'contacts':
        return { label: 'Contatos / CRM', icon: UserIcon, bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
      case 'settings':
        return { label: 'Configurações', icon: Settings, bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
      default:
        return { label: 'Sistema', icon: Activity, bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const getStatusBadge = (status: ActivityLogStatus) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Sucesso</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Aviso</span>
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Erro</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Info className="w-3 h-3 text-blue-600" />
            <span>Info</span>
          </span>
        );
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'agora mesmo';
    if (diffSeconds < 3600) return `há ${Math.floor(diffSeconds / 60)} min`;
    if (diffSeconds < 86400) return `há ${Math.floor(diffSeconds / 3600)} h`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Audit Overview */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#1A1D21] via-[#24292F] to-[#1A1D21] text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">Logs de Atividade & Auditoria de Usuários (Audit Trail)</h2>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Rastreamento completo e em tempo real de todas as ações tomadas pelos membros da equipe dentro do ManyFlow (alterações de fluxo, testes A/B, disparos em massa, novos webhooks e alterações de permissão).
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end">
          <button
            onClick={handleSimulateNewAction}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Simular Ação</span>
          </button>

          <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/10 text-xs">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                autoRefresh ? 'bg-emerald-500 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
              <span>{autoRefresh ? 'Ao Vivo (12s)' : 'Pausado'}</span>
            </button>

            <button
              onClick={fetchLogs}
              disabled={isRefreshing}
              className="px-2.5 py-1.5 text-gray-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Atualizar Agora"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-xs font-medium">Total de Registros</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#1A1D21]">{logs.length}</div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
            <CheckCircle2 className="w-3 h-3" /> 100% Auditável
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-xs font-medium">Usuários Ativos</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-[#1A1D21]">{uniqueUsers.length}</div>
          <span className="text-[10px] text-[#64748B] mt-0.5 block">Membros da equipe com ações</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-xs font-medium">Ações em Fluxos & A/B</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-[#1A1D21]">
            {logs.filter((l) => l.category === 'flow').length}
          </div>
          <span className="text-[10px] text-amber-700 font-bold block mt-0.5">Edições & Variantes</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-xs font-medium">Taxa de Sucesso</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {logs.length > 0
              ? Math.round((logs.filter((l) => l.status === 'success').length / logs.length) * 100)
              : 100}
            %
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Operações sem erros</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por usuário, ação, descrição, recurso ou endereço IP..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF] focus:border-[#0084FF]"
            />
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-[#F8F9FB] hover:bg-gray-200 border border-[#E2E8F0] text-xs font-bold text-[#1A1D21] transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Exportar registros filtrados em planilha CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="px-3 py-2 rounded-xl bg-[#F8F9FB] hover:bg-gray-200 border border-[#E2E8F0] text-xs font-bold text-[#1A1D21] transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Exportar em JSON estruturado"
            >
              <FileJson className="w-3.5 h-3.5 text-[#64748B]" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 text-xs">
          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Módulo / Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] font-medium"
            >
              <option value="all">Todas as Categorias</option>
              <option value="flow">⚡ Fluxos & Automações</option>
              <option value="broadcast">📢 Disparos em Massa</option>
              <option value="webhook">🪝 Webhooks & Subscrições</option>
              <option value="team">👥 Equipe & Permissões</option>
              <option value="meta_app">📘 Apps Meta / Facebook</option>
              <option value="contacts">👤 Contatos & CRM</option>
              <option value="ai_agent">✨ Agente IA Gemini</option>
              <option value="settings">⚙️ Configurações Gerais</option>
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Usuário Responsável</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] font-medium"
            >
              <option value="all">Todos os Usuários ({uniqueUsers.length})</option>
              {uniqueUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Status da Ação</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] font-medium"
            >
              <option value="all">Todos os Status</option>
              <option value="success">✅ Sucesso</option>
              <option value="info">ℹ️ Informativo</option>
              <option value="warning">⚠️ Aviso</option>
              <option value="error">❌ Erro</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Período</label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] font-medium"
            >
              <option value="all">Todo o Histórico</option>
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8F9FB]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#64748B]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1D21]">
              Histórico Cronológico de Atividades ({filteredLogs.length})
            </h3>
          </div>
          <span className="text-[11px] text-[#64748B]">Ordenado por mais recente</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-[#64748B]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-xs">Carregando logs de atividade...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-[#64748B]">
            <Activity className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-bold text-[#1A1D21]">Nenhum registro encontrado</p>
            <p className="text-xs text-[#64748B] mt-1">Tente ajustar seus filtros ou termos de pesquisa.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-gray-50/70 text-[#64748B] text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Data / Hora</th>
                  <th className="py-3 px-4">Usuário</th>
                  <th className="py-3 px-4">Módulo</th>
                  <th className="py-3 px-4">Ação / Título</th>
                  <th className="py-3 px-4">Recurso</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredLogs.map((log) => {
                  const cat = getCategoryBadge(log.category);
                  const Icon = cat.icon;

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      {/* Date / Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[#1A1D21]">
                          {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-[#64748B] flex items-center gap-1 mt-0.5">
                          <span>{new Date(log.createdAt).toLocaleDateString('pt-BR')}</span>
                          <span>•</span>
                          <span className="text-blue-600 font-medium">{formatRelativeTime(log.createdAt)}</span>
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          {log.userAvatar ? (
                            <img
                              src={log.userAvatar}
                              alt={log.userName}
                              className="w-7 h-7 rounded-full object-cover border border-gray-200"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                              {log.userName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-[#1A1D21] flex items-center gap-1.5">
                              <span>{log.userName}</span>
                              {log.userRole && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-700">
                                  {log.userRole}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#64748B]">{log.userEmail}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${cat.bg} ${cat.text} ${cat.border}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{cat.label}</span>
                        </span>
                      </td>

                      {/* Action & Title */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        <div className="font-bold text-[#1A1D21] group-hover:text-blue-600 transition-colors">
                          {log.title}
                        </div>
                        <div className="text-[11px] text-[#64748B] truncate mt-0.5">{log.description}</div>
                      </td>

                      {/* Resource Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {log.entityName ? (
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                            <span>{log.entityName}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(log.status)}</td>

                      {/* View Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-[#64748B] transition-colors font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Detail Modal / Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-[#F8F9FB] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                    Detalhes do Evento de Auditoria
                  </span>
                  <h3 className="text-sm font-bold text-[#1A1D21]">{selectedLog.title}</h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Top Meta Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">ID do Registro</span>
                  <div className="font-mono text-[11px] font-bold text-[#1A1D21] flex items-center gap-1 mt-0.5">
                    <span>{selectedLog.id}</span>
                    <button
                      onClick={() => copyToClipboard(selectedLog.id, 'modal_id')}
                      className="text-gray-400 hover:text-blue-600 cursor-pointer"
                    >
                      {copiedId === 'modal_id' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">Data e Hora Exata</span>
                  <span className="font-semibold text-[#1A1D21]">
                    {new Date(selectedLog.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">Status</span>
                  <div className="mt-0.5">{getStatusBadge(selectedLog.status)}</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">Usuário Responsável</span>
                  <span className="font-bold text-[#1A1D21]">
                    {selectedLog.userName} ({selectedLog.userRole || 'Membro'})
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">E-mail</span>
                  <span className="text-[#64748B] font-mono text-[11px]">{selectedLog.userEmail}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">IP de Origem</span>
                  <span className="font-mono text-[11px] text-gray-700">{selectedLog.ipAddress || '187.54.120.45'}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider block mb-1">
                  Descrição da Ação Realizada:
                </span>
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-950 font-medium leading-relaxed">
                  {selectedLog.description}
                </div>
              </div>

              {/* Before / After Diff if present */}
              {selectedLog.diff && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider block">
                    Modificações Registradas (Diff):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                      <span className="text-[10px] font-bold text-rose-800 uppercase block">Estado Anterior:</span>
                      <pre className="font-mono text-[11px] text-rose-900 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.diff.before, null, 2)}
                      </pre>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">Novo Estado:</span>
                      <pre className="font-mono text-[11px] text-emerald-900 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.diff.after, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata JSON */}
              {selectedLog.metadata && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1">
                      <Code className="w-3.5 h-3.5 text-blue-600" />
                      <span>Metadados & Payload Técnico</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(selectedLog.metadata, null, 2), 'metadata')}
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'metadata' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar JSON</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-[#1A1D21] text-emerald-400 font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {/* User Agent */}
              {selectedLog.userAgent && (
                <div className="text-[10px] text-[#64748B] flex items-center gap-1 border-t border-gray-100 pt-2">
                  <Globe className="w-3 h-3" />
                  <span className="truncate">{selectedLog.userAgent}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F8F9FB] border-t border-[#E2E8F0] flex items-center justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs cursor-pointer transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
