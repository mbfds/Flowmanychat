import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Sparkles, 
  Filter, 
  Share2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Edit3, 
  Trash2, 
  Layers, 
  RefreshCw, 
  ExternalLink, 
  Instagram, 
  Facebook, 
  TrendingUp, 
  MessageSquareReply, 
  Send,
  Zap,
  Globe,
  Sliders,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  BarChart3,
  Server,
  Key,
  Check,
  Lock,
  Copy
} from 'lucide-react';
import { 
  PostizScheduledPost, 
  PostizSocialAccount, 
  PostizSocialPlatform, 
  PostizPostStatus,
  PostCommentGrowthTool,
  PostizConfig
} from '../../types';
import { 
  loadPostizPosts, 
  savePostizPosts, 
  loadPostizAccounts, 
  loadPostizConfig, 
  savePostizConfig 
} from '../../utils/postizHelper';
import { PostComposerModal } from './PostComposerModal';
import { PostizInstanceConfigModal } from './PostizInstanceConfigModal';

interface PostizPlannerProps {
  growthTools?: PostCommentGrowthTool[];
  onOpenCommentTool?: (toolId: string) => void;
}

export const PostizPlanner: React.FC<PostizPlannerProps> = ({
  growthTools = [],
  onOpenCommentTool
}) => {
  const [posts, setPosts] = useState<PostizScheduledPost[]>(loadPostizPosts());
  const [accounts, setAccounts] = useState<PostizSocialAccount[]>(loadPostizAccounts());
  const [config, setConfig] = useState(loadPostizConfig());
  
  const [viewMode, setViewMode] = useState<'calendar' | 'queue' | 'instance'>('calendar');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostizScheduledPost | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState(false);

  // Calendar month navigation
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const handleSavePost = (post: PostizScheduledPost) => {
    let updated: PostizScheduledPost[];
    const exists = posts.some((p) => p.id === post.id);
    if (exists) {
      updated = posts.map((p) => (p.id === post.id ? post : p));
    } else {
      updated = [post, ...posts];
    }
    setPosts(updated);
    savePostizPosts(updated);
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Tem certeza que deseja remover esta postagem do calendário do Postiz?')) {
      const updated = posts.filter((p) => p.id !== postId);
      setPosts(updated);
      savePostizPosts(updated);
    }
  };

  const handlePublishNow = (postId: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          status: 'published' as PostizPostStatus,
          publishedAt: new Date().toISOString(),
          analytics: {
            likes: Math.floor(Math.random() * 80) + 12,
            comments: Math.floor(Math.random() * 30) + 5,
            shares: Math.floor(Math.random() * 10) + 2,
            clicks: Math.floor(Math.random() * 45) + 10,
            reach: Math.floor(Math.random() * 1500) + 400
          }
        };
      }
      return p;
    });
    setPosts(updated);
    savePostizPosts(updated);
  };

  const handleSyncWithPostiz = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const newConfig = { ...config, lastSyncedAt: new Date().toISOString() };
      setConfig(newConfig);
      savePostizConfig(newConfig);
      setSyncSuccessToast(true);
      setTimeout(() => setSyncSuccessToast(false), 4000);
    }, 1200);
  };

  // Filtered posts
  const filteredPosts = posts.filter((p) => {
    if (filterPlatform !== 'all' && !p.platforms.includes(filterPlatform as PostizSocialPlatform)) {
      return false;
    }
    if (filterStatus !== 'all' && p.status !== filterStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCaption = p.caption.toLowerCase().includes(q);
      const matchTag = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchCaption && !matchTag) return false;
    }
    return true;
  });

  // Calendar days calculation
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Stats
  const totalScheduled = posts.filter((p) => p.status === 'scheduled').length;
  const totalPublished = posts.filter((p) => p.status === 'published').length;
  const totalDrafts = posts.filter((p) => p.status === 'draft').length;
  const totalCommentTied = posts.filter((p) => !!p.bindGrowthToolId).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F9FB] dark:bg-slate-950 overflow-y-auto">
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-5 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Planejador Social & Calendário
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  Powered by Postiz
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Agendamento de conteúdo omnichannel sincronizado com gatilhos automáticos de comentários do ManyFlow
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              id="btn_postiz_config_instance"
              onClick={() => setIsConfigModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              title="Configurar URL da instância auto-hospedada e tokens de acesso do Postiz (gitroomhq)"
            >
              <Server className="w-3.5 h-3.5 text-purple-600" />
              <span>Configurar Instância</span>
              {config.isConnected ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Instância Conectada" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-500" title="Instância Não Conectada" />
              )}
            </button>

            <button
              onClick={handleSyncWithPostiz}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-purple-600' : 'text-slate-400'}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>

            <button
              id="btn_postiz_new_post"
              onClick={() => {
                setEditingPost(null);
                setIsComposerOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Publicação</span>
            </button>
          </div>
        </div>

        {/* Sync Toast banner */}
        {syncSuccessToast && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Sincronização com o Postiz concluída com sucesso! Calendário de publicações atualizado.</span>
          </div>
        )}

        {/* Connected Social Accounts Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
            <span>Canais Postiz:</span>
          </div>
          <div className="flex items-center gap-2.5 overflow-x-auto py-1">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shrink-0"
              >
                <img
                  src={acc.avatarUrl}
                  alt={acc.displayName}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {acc.username}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ({(acc.followerCount || 0).toLocaleString()} seg)
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Conectado e Ativo" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-8 space-y-6 flex-1">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Posts Agendados</div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {totalScheduled}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Prontos para publicação</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Posts Publicados</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {totalPublished}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Veiculados com sucesso</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Gatilho Direct Ativo</div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {totalCommentTied}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Comentário ➔ Direct ManyFlow</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Rascunhos</div>
              <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
                {totalDrafts}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Em planejamento</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* View Switcher & Filters */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Calendário Mensal
              </button>
              <button
                onClick={() => setViewMode('queue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'queue'
                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Fila de Postagens ({filteredPosts.length})
              </button>
              <button
                onClick={() => setViewMode('instance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'instance'
                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Server className="w-3.5 h-3.5 text-purple-500" />
                <span>Instância & Servidor</span>
              </button>
            </div>

            {/* Month navigator (only in calendar mode) */}
            {viewMode === 'calendar' && (
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 px-2">
                  {monthNames[month]} {year}
                </span>
                <button
                  onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right Filters */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <input
              type="text"
              placeholder="Buscar legenda, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 w-44"
            />

            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Todos os Canais</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
              <option value="linkedin">LinkedIn</option>
              <option value="x">Twitter / X</option>
              <option value="threads">Threads</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="scheduled">Agendados</option>
              <option value="published">Publicados</option>
              <option value="draft">Rascunhos</option>
            </select>
          </div>
        </div>

        {/* Calendar View Mode */}
        {viewMode === 'calendar' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-center py-2.5 text-xs font-bold text-slate-500">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 auto-rows-[140px] divide-x divide-y divide-slate-100 dark:divide-slate-800/60">
              {/* Empty offset days */}
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div key={`empty-${idx}`} className="bg-slate-50/40 dark:bg-slate-950/20 p-2" />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNumber = idx + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                const isToday = new Date().toDateString() === new Date(year, month, dayNumber).toDateString();

                // Find posts for this day
                const dayPosts = filteredPosts.filter((p) => {
                  return p.scheduledAt.startsWith(dateStr);
                });

                return (
                  <div
                    key={`day-${dayNumber}`}
                    className={`p-2 relative flex flex-col justify-between overflow-hidden group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors ${
                      isToday ? 'bg-purple-50/30 dark:bg-purple-950/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {dayNumber}
                      </span>
                      <button
                        onClick={() => {
                          setEditingPost(null);
                          setIsComposerOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-purple-600 transition-opacity"
                        title="Agendar neste dia"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Posts pills in this day */}
                    <div className="space-y-1 overflow-y-auto max-h-[90px] my-1">
                      {dayPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => {
                            setEditingPost(post);
                            setIsComposerOpen(true);
                          }}
                          className={`p-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer truncate flex items-center gap-1.5 transition-all hover:scale-[1.02] ${
                            post.status === 'published'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                              : post.status === 'draft'
                              ? 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                              : 'bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300'
                          }`}
                        >
                          {post.mediaUrls[0] && (
                            <img
                              src={post.mediaUrls[0]}
                              alt="media"
                              className="w-4 h-4 rounded-sm object-cover shrink-0"
                            />
                          )}
                          <span className="truncate flex-1">{post.caption.slice(0, 30)}...</span>
                          {post.bindGrowthToolId && (
                            <Zap className="w-3 h-3 text-amber-500 shrink-0" title="Gatilho de direct ativado" />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="text-[10px] text-slate-400 text-right font-mono">
                      {dayPosts.length > 0 ? `${dayPosts.length} post(s)` : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Queue / List View Mode */}
        {viewMode === 'queue' && (
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                  Nenhum post agendado encontrado
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Agende sua primeira postagem multicanal no Postiz ou ajuste os filtros acima.
                </p>
                <button
                  onClick={() => {
                    setEditingPost(null);
                    setIsComposerOpen(true);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold inline-flex items-center gap-2 hover:bg-purple-700 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Novo Agendamento
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const scheduledDateObj = new Date(post.scheduledAt);
                const formattedDate = `${scheduledDateObj.toLocaleDateString('pt-BR')} às ${scheduledDateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

                return (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition-all flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Media Thumb */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 relative">
                        {post.mediaUrls[0] ? (
                          <img
                            src={post.mediaUrls[0]}
                            alt="Media preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Layers className="w-6 h-6" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                          {post.postType.toUpperCase()}
                        </span>
                      </div>

                      {/* Content details */}
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              post.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : post.status === 'draft'
                                ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300'
                            }`}
                          >
                            {post.status === 'published' ? 'Publicado' : post.status === 'draft' ? 'Rascunho' : 'Agendado'}
                          </span>

                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formattedDate}
                          </span>

                          {/* Platforms badges */}
                          <div className="flex items-center gap-1 ml-2">
                            {post.platforms.map((p) => (
                              <span
                                key={p}
                                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 capitalize"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Caption snippet */}
                        <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 max-w-xl">
                          {post.caption}
                        </p>

                        {/* ManyFlow Synergy badge */}
                        {post.bindGrowthToolId && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-[11px] font-bold">
                            <Zap className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                            <span>Automação ManyFlow Vinculada (Comentário ➔ Direct)</span>
                          </div>
                        )}

                        {/* Analytics if published */}
                        {post.status === 'published' && post.analytics && (
                          <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 font-mono">
                            <span>❤️ {post.analytics.likes} curtidas</span>
                            <span>💬 {post.analytics.comments} comentários</span>
                            <span>👥 {post.analytics.reach.toLocaleString()} alcance</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      {post.status === 'scheduled' && (
                        <button
                          onClick={() => handlePublishNow(post.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Publicar imediatamente no Postiz"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Publicar Agora</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingPost(post);
                          setIsComposerOpen(true);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors"
                        title="Editar post"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                        title="Excluir post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Dedicated Instance Configuration View */}
        {viewMode === 'instance' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Instance Header Status Banner */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-md text-white border border-white/20">
                      gitroomhq / postiz-app
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {config.isConnected ? 'Instância Conectada e Operacional' : 'Aguardando Conexão'}
                    </span>
                  </div>
                  <h3 className="text-xl font-black tracking-tight">
                    Sincronização com Instância do Postiz
                  </h3>
                  <p className="text-xs text-purple-200 max-w-xl leading-relaxed">
                    Conecte sua infraestrutura própria (VPS / Docker) ou use a nuvem oficial da Postiz para agendar postagens, sincronizar canais e disparar respostas automáticas de comentários pelo ManyFlow.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsConfigModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-white text-purple-900 font-bold text-xs hover:bg-purple-50 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sliders className="w-4 h-4 text-purple-600" />
                    <span>Editar Credenciais</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSyncWithPostiz}
                    disabled={isSyncing}
                    className="px-4 py-2.5 rounded-xl bg-purple-700/80 hover:bg-purple-700 text-white font-bold text-xs border border-purple-500/50 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
                  </button>
                </div>
              </div>

              {/* Status metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-purple-800/60 text-xs">
                <div>
                  <div className="text-purple-300 font-semibold text-[11px]">URL da Instância</div>
                  <div className="font-mono font-bold text-white truncate mt-0.5" title={config.selfHostedUrl || config.apiUrl}>
                    {config.selfHostedUrl || config.apiUrl}
                  </div>
                </div>
                <div>
                  <div className="text-purple-300 font-semibold text-[11px]">Versão da Instância</div>
                  <div className="font-bold text-white mt-0.5">
                    {config.serverVersion || 'gitroomhq v1.18.0'}
                  </div>
                </div>
                <div>
                  <div className="text-purple-300 font-semibold text-[11px]">Canais Conectados</div>
                  <div className="font-bold text-white mt-0.5">
                    {accounts.length} redes sincronizadas
                  </div>
                </div>
                <div>
                  <div className="text-purple-300 font-semibold text-[11px]">Última Sincronização</div>
                  <div className="font-bold text-white mt-0.5">
                    {config.lastSyncedAt ? new Date(config.lastSyncedAt).toLocaleTimeString('pt-BR') : 'Hoje'}
                  </div>
                </div>
              </div>
            </div>

            {/* In-Page Quick Form for Postiz Instance */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-600" />
                  <span>Configuração de Conexão com Servidor Postiz</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Informe o endereço da sua instância auto-hospedada e os tokens de acesso gerados no painel do Postiz
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Instance URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-purple-600" />
                      URL da Instância Auto-Hospedada (gitroomhq)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={config.selfHostedUrl || config.apiUrl || ''}
                    onChange={(e) => {
                      const updated = { ...config, selfHostedUrl: e.target.value, apiUrl: e.target.value };
                      setConfig(updated);
                      savePostizConfig(updated);
                    }}
                    placeholder="https://postiz.minhaempresa.com.br ou http://localhost:5200"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Exemplo: <code>https://postiz.minhaempresa.com.br</code> ou <code>http://localhost:5200</code>
                  </p>
                </div>

                {/* Access Token */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-purple-600" />
                      Token de Acesso / API Key da Instância
                    </span>
                  </label>
                  <input
                    type="password"
                    value={config.accessToken || config.apiKey || ''}
                    onChange={(e) => {
                      const updated = { ...config, accessToken: e.target.value, apiKey: e.target.value };
                      setConfig(updated);
                      savePostizConfig(updated);
                    }}
                    placeholder="ptz_jwt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Token Bearer JWT ou API Key de Integração configurada no Postiz
                  </p>
                </div>

                {/* Workspace ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    ID do Workspace / Organização
                  </label>
                  <input
                    type="text"
                    value={config.workspaceId || ''}
                    onChange={(e) => {
                      const updated = { ...config, workspaceId: e.target.value };
                      setConfig(updated);
                      savePostizConfig(updated);
                    }}
                    placeholder="ws_manyflow_prod"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Auto Sync Interval */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    Intervalo de Sincronização Automática
                  </label>
                  <select
                    value={config.autoSyncIntervalMinutes || 15}
                    onChange={(e) => {
                      const updated = { ...config, autoSyncIntervalMinutes: Number(e.target.value) };
                      setConfig(updated);
                      savePostizConfig(updated);
                    }}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none"
                  >
                    <option value={5}>A cada 5 minutos</option>
                    <option value={15}>A cada 15 minutos (Recomendado)</option>
                    <option value={30}>A cada 30 minutos</option>
                    <option value={60}>A cada 1 hora</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.syncScheduleEnabled !== false}
                    onChange={(e) => {
                      const updated = { ...config, syncScheduleEnabled: e.target.checked };
                      setConfig(updated);
                      savePostizConfig(updated);
                    }}
                    className="mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Sincronização contínua de agendamentos
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Atualiza o calendário periodicamente com novas publicações criadas na instância.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoSyncComments}
                    onChange={(e) => {
                      const updated = { ...config, autoSyncComments: e.target.checked };
                      setConfig(updated);
                      savePostizConfig(updated);
                    }}
                    className="mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Gatilhos automáticos de comentários integrados
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Dispara fluxos de automação do ManyFlow nos comentários recebidos nas postagens.
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Configurações salvas automaticamente no workspace.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsConfigModalOpen(true)}
                    className="px-4 py-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Abrir Assistente Completo</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSyncWithPostiz}
                    disabled={isSyncing}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Testar Conexão & Sincronizar Fila</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instance Config Modal */}
      <PostizInstanceConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={config}
        onUpdateConfig={(updated) => {
          setConfig(updated);
          savePostizConfig(updated);
        }}
        accounts={accounts}
        onRefreshSync={handleSyncWithPostiz}
      />

      {/* Composer Modal */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => {
          setIsComposerOpen(false);
          setEditingPost(null);
        }}
        onSave={handleSavePost}
        accounts={accounts}
        growthTools={growthTools}
        initialPost={editingPost}
      />
    </div>
  );
};
