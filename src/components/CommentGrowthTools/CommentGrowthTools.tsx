import React, { useState } from 'react';
import { 
  MessageSquareReply, 
  Sparkles, 
  Plus, 
  Instagram, 
  Facebook,
  ThumbsUp, 
  Flame, 
  Share2, 
  CheckCircle2, 
  Bot, 
  Play, 
  Trash2,
  ExternalLink,
  ShieldCheck,
  Globe,
  Film,
  Image as ImageIcon,
  Layers,
  Check,
  Clock,
  Search,
  Filter,
  Copy,
  ChevronRight,
  Zap,
  Info,
  X,
  Sliders,
  Radio,
  RefreshCw,
  Video,
  RadioTower,
  Tag,
  AlertCircle
} from 'lucide-react';
import { PostCommentGrowthTool, Flow, ConnectedMetaAccount, MetaPostItem } from '../../types';
import { INITIAL_CONNECTED_ACCOUNTS, INITIAL_META_POSTS } from '../../data/initialData';

interface CommentGrowthToolsProps {
  growthTools: PostCommentGrowthTool[];
  flows: Flow[];
  onUpdateGrowthTools: (tools: PostCommentGrowthTool[]) => void;
  openSimulator: () => void;
}

export const CommentGrowthTools: React.FC<CommentGrowthToolsProps> = ({
  growthTools,
  flows,
  onUpdateGrowthTools,
  openSimulator
}) => {
  const [selectedToolId, setSelectedToolId] = useState<string>(growthTools[0]?.id || '');
  const [connectedAccounts] = useState<ConnectedMetaAccount[]>(INITIAL_CONNECTED_ACCOUNTS);
  const [metaPosts] = useState<MetaPostItem[]>(INITIAL_META_POSTS);

  // Filter state
  const [filterScope, setFilterScope] = useState<'all' | 'all_posts' | 'specific_post'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isPostPickerOpen, setIsPostPickerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [postSearchQuery, setPostSearchQuery] = useState('');
  const [customPostUrlInput, setCustomPostUrlInput] = useState('');

  // Form states inside editor
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newVariation, setNewVariation] = useState('');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Modal Create Form State
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleScope, setNewRuleScope] = useState<'all_posts' | 'specific_post' | 'next_post'>('all_posts');
  const [newRuleApplyAllPages, setNewRuleApplyAllPages] = useState(true);
  const [newRuleSelectedPages, setNewRuleSelectedPages] = useState<string[]>(['acc_ig_main']);
  const [newRuleSelectedPostId, setNewRuleSelectedPostId] = useState<string>(INITIAL_META_POSTS[0]?.id || '');
  const [newRuleKeywords, setNewRuleKeywords] = useState<string[]>(['QUERO', 'CUPOM']);
  const [newRuleTargetFlowId, setNewRuleTargetFlowId] = useState<string>(flows[0]?.id || '');

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3000);
  };

  const selectedTool = growthTools.find((t) => t.id === selectedToolId) || growthTools[0];

  const updateCurrentTool = (patch: Partial<PostCommentGrowthTool>) => {
    if (!selectedTool) return;
    const updated = growthTools.map((t) =>
      t.id === selectedTool.id ? { ...t, ...patch } : t
    );
    onUpdateGrowthTools(updated);
  };

  const handleToggleActive = (toolId: string) => {
    const updated = growthTools.map((t) =>
      t.id === toolId ? { ...t, isActive: !t.isActive } : t
    );
    onUpdateGrowthTools(updated);
  };

  // 1-Click Fast Apply to All Pages
  const handleToggleApplyAllPages = (applyAll: boolean) => {
    if (!selectedTool) return;
    const targetPages = applyAll 
      ? ['all_pages'] 
      : [connectedAccounts[0]?.id || 'acc_ig_main'];
    
    updateCurrentTool({
      applyToAllPages: applyAll,
      targetPages,
      channel: applyAll ? 'omnichannel' : 'instagram'
    });

    showToast(
      applyAll 
        ? '⚡ Automação sincronizada com TODAS as páginas e perfis conectados!' 
        : 'Automação configurada para páginas selecionadas.'
    );
  };

  // Toggle specific page for tool
  const handleTogglePage = (accountId: string) => {
    if (!selectedTool) return;
    let current = selectedTool.targetPages || [];
    if (current.includes('all_pages')) {
      current = connectedAccounts.map(a => a.id);
    }
    const exists = current.includes(accountId);
    let updatedPages = exists
      ? current.filter(id => id !== accountId)
      : [...current, accountId];
    
    if (updatedPages.length === 0) {
      updatedPages = [accountId]; // Keep at least one
    }

    const allSelected = updatedPages.length === connectedAccounts.length;

    updateCurrentTool({
      targetPages: allSelected ? ['all_pages'] : updatedPages,
      applyToAllPages: allSelected,
      channel: allSelected ? 'omnichannel' : 'instagram'
    });
  };

  // Switch Scope: All Posts vs Specific Post vs Next Post
  const handleSetScope = (scope: 'all_posts' | 'specific_post' | 'next_post') => {
    if (!selectedTool) return;
    if (scope === 'all_posts') {
      updateCurrentTool({
        postType: 'all_posts',
        postId: undefined,
        title: selectedTool.title.includes('Reel') || selectedTool.title.includes('Post') 
          ? `🌟 Regra Geral: Todos os Posts & Reels (${selectedTool.triggerKeywords.slice(0, 2).join('/')})`
          : selectedTool.title
      });
      showToast('🌐 Automação configurada para TODOS os posts e Reels atuais e futuros!');
    } else if (scope === 'specific_post') {
      const defaultPost = metaPosts[0];
      updateCurrentTool({
        postType: 'specific_post',
        postId: defaultPost?.id || 'post_reel_01',
        postPreviewUrl: defaultPost?.mediaUrl,
        postCaption: defaultPost?.caption,
        title: `Post Único: ${defaultPost?.caption?.slice(0, 38)}...`
      });
      showToast('🎯 Automação configurada para Post Específico. Selecione o post desejado.');
    } else {
      updateCurrentTool({
        postType: 'next_post',
        postId: undefined,
        title: `🚀 Próximo Post / Reel publicado (${selectedTool.triggerKeywords.slice(0, 2).join('/')})`
      });
      showToast('🚀 Automação aguardando a próxima publicação para ativar.');
    }
  };

  // Select Post from Gallery
  const handleSelectPost = (post: MetaPostItem) => {
    if (!selectedTool) return;
    updateCurrentTool({
      postType: 'specific_post',
      postId: post.id,
      postPreviewUrl: post.mediaUrl,
      postCaption: post.caption,
      title: `${post.type === 'reel' ? 'Reel' : 'Post'}: ${post.caption.slice(0, 36)}...`
    });
    setIsPostPickerOpen(false);
    showToast(`Post "${post.caption.slice(0, 25)}..." selecionado com sucesso!`);
  };

  // Select Post by URL
  const handleSelectPostByUrl = () => {
    if (!customPostUrlInput.trim()) return;
    const url = customPostUrlInput.trim();
    updateCurrentTool({
      postType: 'specific_post',
      postId: `post_custom_${Date.now()}`,
      postPreviewUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
      postCaption: `Publicação vinculada via link direto: ${url}`,
      title: `Post Via Link: ${url.slice(0, 30)}...`
    });
    setCustomPostUrlInput('');
    setIsPostPickerOpen(false);
    showToast('Link do post vinculado com sucesso!');
  };

  // Keyword handlers
  const handleAddKeyword = () => {
    if (!newKeyword.trim() || !selectedTool) return;
    const word = newKeyword.trim().toUpperCase();
    if (!selectedTool.triggerKeywords.includes(word)) {
      updateCurrentTool({
        triggerKeywords: [...selectedTool.triggerKeywords, word]
      });
    }
    setNewKeyword('');
  };

  const handleRemoveKeyword = (index: number) => {
    if (!selectedTool) return;
    updateCurrentTool({
      triggerKeywords: selectedTool.triggerKeywords.filter((_, i) => i !== index)
    });
  };

  // Variation handlers
  const handleAddVariation = () => {
    if (!newVariation.trim() || !selectedTool) return;
    updateCurrentTool({
      publicReplyVariations: [...selectedTool.publicReplyVariations, newVariation.trim()]
    });
    setNewVariation('');
  };

  const handleRemoveVariation = (index: number) => {
    if (!selectedTool) return;
    updateCurrentTool({
      publicReplyVariations: selectedTool.publicReplyVariations.filter((_, i) => i !== index)
    });
  };

  // Gemini AI Copy Variations
  const handleGenerateAIVariations = async () => {
    if (!selectedTool) return;
    setIsGeneratingCopy(true);
    try {
      const res = await fetch('/api/ai/optimize-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: selectedTool.publicReplyVariations[0] || 'Te mandei o link no Direct! Dá uma olhada lá 🚀',
          type: 'Resposta a comentário no Instagram com aviso de DM enviada e anti-bloqueio Meta',
          count: 4
        })
      });
      const data = await res.json();
      if (data.variations && data.variations.length > 0) {
        const updated = Array.from(new Set([...selectedTool.publicReplyVariations, ...data.variations]));
        updateCurrentTool({ publicReplyVariations: updated });
        showToast('✨ Novas variações anti-spam geradas com sucesso!');
      }
    } catch (e) {
      console.error(e);
      // Fallback
      const fallbacks = [
        "Acabei de te enviar no Direct com acesso liberado! 🚀",
        "Prontinho! Link enviado na sua mensagem privada ✨",
        "Olha seu inbox! Acabei de mandar todos os detalhes 📲",
        "Te respondi no privado com carinho! Qualquer dúvida estou por lá 😉"
      ];
      const updated = Array.from(new Set([...selectedTool.publicReplyVariations, ...fallbacks]));
      updateCurrentTool({ publicReplyVariations: updated });
      showToast('✨ Variações otimizadas adicionadas!');
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  // Create New Rule Modal Submit
  const handleCreateRuleSubmit = () => {
    const title = newRuleTitle.trim() || (newRuleScope === 'all_posts' ? 'Regra Geral para Todos os Posts' : 'Automação para Post Específico');
    const selectedPost = metaPosts.find(p => p.id === newRuleSelectedPostId) || metaPosts[0];

    const newTool: PostCommentGrowthTool = {
      id: `cg_${Date.now()}`,
      title,
      channel: newRuleApplyAllPages ? 'omnichannel' : 'instagram',
      postType: newRuleScope,
      postId: newRuleScope === 'specific_post' ? selectedPost.id : undefined,
      postPreviewUrl: newRuleScope === 'specific_post' ? selectedPost.mediaUrl : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      postCaption: newRuleScope === 'specific_post' ? selectedPost.caption : '⚡ Aplicado a todas as publicações e Reels atuais e futuros.',
      targetPages: newRuleApplyAllPages ? ['all_pages'] : newRuleSelectedPages,
      applyToAllPages: newRuleApplyAllPages,
      includeReels: true,
      includeFeedPosts: true,
      includeLiveComments: true,
      includeMetaAds: true,
      triggerMode: 'keywords_only',
      triggerKeywords: newRuleKeywords.length > 0 ? newRuleKeywords : ['QUERO', 'CUPOM'],
      matchAnyKeyword: true,
      publicReplyVariations: [
        "Acabei de te enviar no Direct! Dá uma olhada nas suas mensagens 🚀",
        "Prontinho! Link liberado no seu inbox privado ✨",
        "Te respondi por mensagem direta! Confere lá 😉"
      ],
      publicReplyDelaySeconds: 2,
      autoLikeComment: true,
      targetFlowId: newRuleTargetFlowId || flows[0]?.id || '',
      isActive: true,
      stats: {
        commentsChecked: 0,
        dmsSent: 0,
        conversionRate: 100
      }
    };

    onUpdateGrowthTools([newTool, ...growthTools]);
    setSelectedToolId(newTool.id);
    setIsCreateModalOpen(false);
    showToast('Nova automação de comentário criada com sucesso!');
  };

  // Filtered growth tools list
  const filteredTools = growthTools.filter((tool) => {
    if (filterScope === 'all_posts' && tool.postType !== 'all_posts') return false;
    if (filterScope === 'specific_post' && tool.postType !== 'specific_post' && tool.postType !== 'next_post') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tool.title.toLowerCase().includes(q) ||
        tool.postCaption?.toLowerCase().includes(q) ||
        tool.triggerKeywords.some(k => k.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate target pages display text for tool
  const getPagesBadge = (tool: PostCommentGrowthTool) => {
    if (tool.applyToAllPages || tool.targetPages?.includes('all_pages')) {
      return {
        text: `🌐 Todas as Páginas (${connectedAccounts.length})`,
        isAll: true
      };
    }
    const count = tool.targetPages?.length || 1;
    return {
      text: `${count} Página${count > 1 ? 's' : ''} Conectada${count > 1 ? 's' : ''}`,
      isAll: false
    };
  };

  return (
    <div id="comment_growth_tools_view" className="flex-1 flex flex-col h-full bg-[#F8F9FB] overflow-hidden select-none">
      {/* Toast notification */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1D21] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200 border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Top Main Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-pink-50 border border-pink-200 text-pink-600">
              <MessageSquareReply className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-[#1A1D21]">
              Automações de Comentários no Post ➔ Envio no Direct
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Configure respostas automáticas para <strong>Todos os Posts (Global)</strong> ou para <strong>Posts Específicos</strong>, e aplique facilmente em <strong>Todas as Páginas</strong> conectadas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="py-2 px-3.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Regra de Comentário</span>
          </button>

          <button
            onClick={openSimulator}
            className="py-2 px-3.5 rounded-xl bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Simulador de Comentário</span>
          </button>
        </div>
      </div>

      {/* Quick Global Action Bar: Apply to All Pages Notice */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-pink-50 border-b border-blue-100 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#1A1D21]">
          <Globe className="w-4 h-4 text-[#0084FF]" />
          <span className="font-bold">Multicanais Meta:</span>
          <span className="text-[#64748B]">
            {connectedAccounts.length} perfis/páginas sincronizados ({connectedAccounts.filter(a => a.channel === 'instagram').length} Instagram, {connectedAccounts.filter(a => a.channel === 'messenger').length} Facebook)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#64748B] hidden sm:inline">
            Deseja que qualquer seguidor que comente receba a DM em todas as contas?
          </span>
          <button
            onClick={() => handleToggleApplyAllPages(true)}
            className="px-3 py-1 bg-white hover:bg-blue-50 border border-blue-200 text-[#0084FF] rounded-lg font-bold text-[11px] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Ativar em Todas as Páginas</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Rules List, Right Detail Config */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Automation Rules Explorer */}
        <div className="w-full lg:w-96 border-r border-[#E2E8F0] bg-white flex flex-col shrink-0 overflow-hidden">
          {/* Filter Bar & Search */}
          <div className="p-3 border-b border-[#E2E8F0] space-y-2 bg-[#F8F9FB]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar automações de post..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
              />
            </div>

            {/* Scope Filter Tabs */}
            <div className="flex rounded-lg bg-gray-200/70 p-0.5 text-[11px] font-bold">
              <button
                onClick={() => setFilterScope('all')}
                className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
                  filterScope === 'all'
                    ? 'bg-white text-[#1A1D21] shadow-2xs'
                    : 'text-[#64748B] hover:text-[#1A1D21]'
                }`}
              >
                Todas ({growthTools.length})
              </button>
              <button
                onClick={() => setFilterScope('all_posts')}
                className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
                  filterScope === 'all_posts'
                    ? 'bg-white text-[#0084FF] shadow-2xs'
                    : 'text-[#64748B] hover:text-[#1A1D21]'
                }`}
              >
                Todos os Posts
              </button>
              <button
                onClick={() => setFilterScope('specific_post')}
                className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
                  filterScope === 'specific_post'
                    ? 'bg-white text-pink-600 shadow-2xs'
                    : 'text-[#64748B] hover:text-[#1A1D21]'
                }`}
              >
                Post Único
              </button>
            </div>
          </div>

          {/* List of Rules */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredTools.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageSquareReply className="w-8 h-8 text-gray-300 mx-auto" />
                <div className="text-xs font-bold text-[#1A1D21]">Nenhuma regra encontrada</div>
                <p className="text-[11px] text-[#64748B]">Tente ajustar os filtros ou crie uma nova regra de comentário.</p>
              </div>
            ) : (
              filteredTools.map((tool) => {
                const isSelected = tool.id === selectedTool?.id;
                const pagesInfo = getPagesBadge(tool);
                const isAllPosts = tool.postType === 'all_posts';

                return (
                  <div
                    key={tool.id}
                    onClick={() => setSelectedToolId(tool.id)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-4 border-[#0084FF]'
                        : 'hover:bg-gray-50/80 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail or Scope Icon */}
                      <div className="relative shrink-0">
                        {isAllPosts ? (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex flex-col items-center justify-center p-1 shadow-xs">
                            <Globe className="w-5 h-5" />
                            <span className="text-[9px] font-black uppercase tracking-tighter mt-0.5">TODOS</span>
                          </div>
                        ) : (
                          <img
                            src={tool.postPreviewUrl || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80'}
                            alt="Post Thumbnail"
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-xl object-cover border border-[#E2E8F0] shadow-xs"
                          />
                        )}
                        <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${tool.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            isAllPosts 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-pink-100 text-pink-800'
                          }`}>
                            {isAllPosts ? '🌐 Todos os Posts' : '🎯 Post Específico'}
                          </span>

                          <span className={`text-[10px] font-bold ${tool.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {tool.isActive ? 'Ativo' : 'Pausado'}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-[#1A1D21] truncate">
                          {tool.title}
                        </h4>

                        <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-pink-600">
                            {tool.triggerKeywords.slice(0, 3).map(k => `"${k}"`).join(', ')}
                          </span>
                        </div>

                        <div className="pt-1 flex items-center justify-between text-[10px] text-[#64748B]">
                          <span className="font-medium truncate max-w-[140px]">
                            {pagesInfo.text}
                          </span>
                          <span className="font-bold text-[#1A1D21]">
                            {tool.stats.dmsSent} DMs enviadas
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Configuration Panel */}
        {selectedTool ? (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-[#F8F9FB]">
            {/* Top Card: Title & Global Toggle */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      selectedTool.postType === 'all_posts' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-pink-100 text-pink-800'
                    }`}>
                      {selectedTool.postType === 'all_posts' ? '🌐 Modo Todos os Posts (Evergreen)' : '🎯 Post / Reel Selecionado'}
                    </span>
                    <span className="text-xs text-[#64748B]">ID: {selectedTool.id}</span>
                  </div>
                  <input
                    type="text"
                    value={selectedTool.title}
                    onChange={(e) => updateCurrentTool({ title: e.target.value })}
                    className="text-base font-bold text-[#1A1D21] bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#0084FF] focus:outline-none w-full"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(selectedTool.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedTool.isActive
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${selectedTool.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span>{selectedTool.isActive ? 'Automação Ativa' : 'Automação Pausada'}</span>
                  </button>
                </div>
              </div>

              {/* SECTION 1: ESCOPO DO POST (TODOS OS POSTS VS POST ÚNICO) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#0084FF]" />
                    <span>1. Escopo da Automação: Todos os Posts ou Post Único</span>
                  </label>
                  <span className="text-[11px] text-[#64748B]">Escolha onde a regra atuará</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Option 1: ALL POSTS (Global) */}
                  <div
                    onClick={() => handleSetScope('all_posts')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedTool.postType === 'all_posts'
                        ? 'border-[#0084FF] bg-blue-50/50 shadow-xs'
                        : 'border-[#E2E8F0] bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-blue-100 text-[#0084FF]">
                          <Globe className="w-5 h-5" />
                        </div>
                        {selectedTool.postType === 'all_posts' && (
                          <span className="p-1 rounded-full bg-[#0084FF] text-white">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs text-[#1A1D21]">
                        Todos os Posts & Reels
                      </div>
                      <p className="text-[11px] text-[#64748B] leading-relaxed">
                        Aplica-se automaticamente a <strong>qualquer post, Reel ou carrossel</strong> atual e futuro publicado na sua conta.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-blue-200/50 text-[10px] font-bold text-[#0084FF]">
                      ⚡ Sem precisar selecionar post a post
                    </div>
                  </div>

                  {/* Option 2: SPECIFIC POST (Single) */}
                  <div
                    onClick={() => handleSetScope('specific_post')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedTool.postType === 'specific_post'
                        ? 'border-pink-500 bg-pink-50/50 shadow-xs'
                        : 'border-[#E2E8F0] bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-pink-100 text-pink-600">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        {selectedTool.postType === 'specific_post' && (
                          <span className="p-1 rounded-full bg-pink-600 text-white">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs text-[#1A1D21]">
                        Post / Reel Específico (Único)
                      </div>
                      <p className="text-[11px] text-[#64748B] leading-relaxed">
                        Aplica-se <strong>apenas a uma publicação específica</strong> selecionada da sua galeria ou por link do Instagram/FB.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-pink-200/50 text-[10px] font-bold text-pink-600">
                      🎯 Ideal para lançamentos e campanhas pontuais
                    </div>
                  </div>

                  {/* Option 3: NEXT POST */}
                  <div
                    onClick={() => handleSetScope('next_post')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedTool.postType === 'next_post'
                        ? 'border-purple-500 bg-purple-50/50 shadow-xs'
                        : 'border-[#E2E8F0] bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                          <Film className="w-5 h-5" />
                        </div>
                        {selectedTool.postType === 'next_post' && (
                          <span className="p-1 rounded-full bg-purple-600 text-white">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs text-[#1A1D21]">
                        Próxima Publicação que Postar
                      </div>
                      <p className="text-[11px] text-[#64748B] leading-relaxed">
                        Fica em espera e <strong>ativa automaticamente no primeiro post ou Reel</strong> que você publicar a seguir.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-purple-200/50 text-[10px] font-bold text-purple-600">
                      🚀 Deixe pronto antes de postar
                    </div>
                  </div>
                </div>

                {/* Sub-config when ALL POSTS is selected */}
                {selectedTool.postType === 'all_posts' && (
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#0084FF]" />
                      <span className="text-xs font-bold text-blue-950">
                        Tipos de Publicações Cobertas pela Regra Geral:
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <label className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-blue-200/60 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTool.includeReels !== false}
                          onChange={(e) => updateCurrentTool({ includeReels: e.target.checked })}
                          className="rounded accent-[#0084FF]"
                        />
                        <span className="font-medium text-[#1A1D21]">Reels</span>
                      </label>

                      <label className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-blue-200/60 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTool.includeFeedPosts !== false}
                          onChange={(e) => updateCurrentTool({ includeFeedPosts: e.target.checked })}
                          className="rounded accent-[#0084FF]"
                        />
                        <span className="font-medium text-[#1A1D21]">Feed & Carrosséis</span>
                      </label>

                      <label className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-blue-200/60 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTool.includeLiveComments !== false}
                          onChange={(e) => updateCurrentTool({ includeLiveComments: e.target.checked })}
                          className="rounded accent-[#0084FF]"
                        />
                        <span className="font-medium text-[#1A1D21]">Comentários em Lives</span>
                      </label>

                      <label className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-blue-200/60 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTool.includeMetaAds !== false}
                          onChange={(e) => updateCurrentTool({ includeMetaAds: e.target.checked })}
                          className="rounded accent-[#0084FF]"
                        />
                        <span className="font-medium text-[#1A1D21]">Anúncios (Meta Ads)</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Sub-config when SPECIFIC POST is selected */}
                {selectedTool.postType === 'specific_post' && (
                  <div className="p-4 rounded-xl bg-pink-50/60 border border-pink-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-pink-950">
                        Publicação Conectada:
                      </span>
                      <button
                        onClick={() => setIsPostPickerOpen(true)}
                        className="px-3 py-1.5 bg-white hover:bg-pink-100 border border-pink-300 text-pink-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Trocar / Selecionar Post da Galeria</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-pink-200">
                      <img
                        src={selectedTool.postPreviewUrl || metaPosts[0]?.mediaUrl}
                        alt="Post Preview"
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover border border-[#E2E8F0] shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-100 text-pink-700">
                            Post Selecionado
                          </span>
                          <span className="text-xs text-[#64748B]">ID: {selectedTool.postId || 'post_reel_01'}</span>
                        </div>
                        <p className="text-xs font-medium text-[#1A1D21] line-clamp-2">
                          {selectedTool.postCaption || 'Publicação do Instagram / Facebook'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: APLICAR EM TODAS AS PÁGINAS & CONTAS CONECTADAS */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>2. Páginas & Perfis Conectados (Fácil Aplicação em Todas as Páginas)</span>
                  </label>
                  <button
                    onClick={() => handleToggleApplyAllPages(!selectedTool.applyToAllPages)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedTool.applyToAllPages || selectedTool.targetPages?.includes('all_pages')
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-gray-100 text-[#64748B] hover:text-[#1A1D21]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Aplicar a TODAS as Páginas ({connectedAccounts.length})</span>
                  </button>
                </div>

                <p className="text-xs text-[#64748B]">
                  Marque ou desmarque as contas onde você quer que este robô responda os comentários e envie os Directs.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {connectedAccounts.map((acc) => {
                    const isAll = selectedTool.applyToAllPages || selectedTool.targetPages?.includes('all_pages');
                    const isChecked = isAll || (selectedTool.targetPages && selectedTool.targetPages.includes(acc.id));

                    return (
                      <div
                        key={acc.id}
                        onClick={() => handleTogglePage(acc.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isChecked
                            ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                            : 'bg-white border-[#E2E8F0] opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={acc.avatarUrl}
                            alt={acc.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0] shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              {acc.channel === 'instagram' ? (
                                <Instagram className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                              ) : (
                                <Facebook className="w-3.5 h-3.5 text-[#0084FF] shrink-0" />
                              )}
                              <span className="font-bold text-xs text-[#1A1D21] truncate">{acc.name}</span>
                            </div>
                            <div className="text-[11px] text-[#64748B] truncate">{acc.handle}</div>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECTION 3: PALAVRAS-CHAVE GATILHO OU QUALQUER COMENTÁRIO */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-pink-600" />
                  <span>3. Gatilho: Palavras-Chave no Comentário</span>
                </label>

                {/* Mode Selector: Keywords Only vs Any Comment */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCurrentTool({ triggerMode: 'keywords_only' })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedTool.triggerMode !== 'any_comment'
                        ? 'bg-pink-100 text-pink-800 border border-pink-200'
                        : 'text-[#64748B] hover:text-[#1A1D21]'
                    }`}
                  >
                    Apenas com Palavras-Chave
                  </button>
                  <button
                    onClick={() => updateCurrentTool({ triggerMode: 'any_comment' })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedTool.triggerMode === 'any_comment'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'text-[#64748B] hover:text-[#1A1D21]'
                    }`}
                  >
                    Com QUALQUER Comentário
                  </button>
                </div>
              </div>

              {selectedTool.triggerMode === 'any_comment' ? (
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-purple-950">
                      Modo "Qualquer Comentário" Ativo:
                    </div>
                    <p className="text-xs text-purple-900/80 mt-0.5">
                      Qualquer pessoa que comentar qualquer coisa nas suas postagens receberá a resposta pública e a mensagem privada no Direct automaticamente.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#64748B]">
                    O robô será ativado quando o comentário do seguidor contiver qualquer uma das palavras abaixo:
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                      placeholder="Ex: QUERO, CUPOM, LINK, AULA, DESCONTO, PLANILHA..."
                      className="flex-1 px-3 py-2 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:ring-1 focus:ring-[#0084FF] focus:border-[#0084FF]"
                    />
                    <button
                      onClick={handleAddKeyword}
                      className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedTool.triggerKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-pink-50 text-pink-700 border border-pink-200 flex items-center gap-2 shadow-2xs"
                      >
                        <span>"{kw}"</span>
                        <button
                          onClick={() => handleRemoveKeyword(i)}
                          className="hover:text-rose-600 cursor-pointer font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: RESPOSTAS PÚBLICAS AO COMENTÁRIO (ANTI-SPAM ROTATIVO) */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>4. Respostas Públicas ao Comentário (Meta Anti-Bloqueio)</span>
                  </label>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                    Rotativo
                  </span>
                </div>

                {/* AI Generator Button */}
                <button
                  onClick={handleGenerateAIVariations}
                  disabled={isGeneratingCopy}
                  className="py-1.5 px-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isGeneratingCopy ? 'Gerando com IA...' : 'Gerar Novas Variações com IA'}</span>
                </button>
              </div>

              <p className="text-xs text-[#64748B]">
                O robô alterna aleatoriamente entre essas frases para responder o comentário no post, garantindo que o algoritmo da Meta não bloqueie sua conta por respostas idênticas.
              </p>

              <div className="space-y-2">
                {selectedTool.publicReplyVariations.map((v, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
                  >
                    <span className="flex-1">{v}</span>
                    <button
                      onClick={() => handleRemoveVariation(idx)}
                      className="text-[#64748B] hover:text-rose-600 p-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newVariation}
                  onChange={(e) => setNewVariation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddVariation()}
                  placeholder="Adicionar variação manual de resposta pública..."
                  className="flex-1 px-3 py-2 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
                />
                <button
                  onClick={handleAddVariation}
                  className="px-4 py-2 bg-white hover:bg-gray-50 border border-[#E2E8F0] text-[#1A1D21] text-xs font-bold rounded-xl cursor-pointer"
                >
                  Adicionar
                </button>
              </div>

              {/* Extra Automation Options */}
              <div className="pt-2 border-t border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-xs text-[#1A1D21] cursor-pointer p-2.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0]">
                  <input
                    type="checkbox"
                    checked={selectedTool.autoLikeComment}
                    onChange={(e) => updateCurrentTool({ autoLikeComment: e.target.checked })}
                    className="rounded accent-pink-500"
                  />
                  <span>Curtir automaticamente o comentário do seguidor</span>
                </label>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs">
                  <span className="text-[#64748B]">Delay para responder:</span>
                  <select
                    value={selectedTool.publicReplyDelaySeconds ?? 2}
                    onChange={(e) => updateCurrentTool({ publicReplyDelaySeconds: Number(e.target.value) })}
                    className="bg-white border border-[#E2E8F0] rounded-md px-2 py-1 text-xs font-bold text-[#1A1D21]"
                  >
                    <option value={0}>Imediato (0s)</option>
                    <option value={2}>2 segundos (Natural)</option>
                    <option value={5}>5 segundos</option>
                    <option value={15}>15 segundos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 5: FLUXO DE MENSAGENS ENVIADO NO DIRECT */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-[#0084FF]" />
                  <span>5. Fluxo de Boas-Vindas & Oferta Enviado no Direct</span>
                </label>
                <span className="text-[11px] text-[#0084FF] font-bold">
                  {flows.length} fluxos disponíveis
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0]">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#1A1D21]">Fluxo de Conversa Conectado:</div>
                  <p className="text-[11px] text-[#64748B]">
                    Quando o comentário for detectado, o bot iniciará este fluxo imediatamente no Direct da pessoa.
                  </p>
                </div>

                <select
                  value={selectedTool.targetFlowId}
                  onChange={(e) => updateCurrentTool({ targetFlowId: e.target.value })}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[#0084FF] font-bold text-xs shadow-2xs max-w-[280px] truncate"
                >
                  {flows.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-[#64748B]">
            Selecione uma regra de comentário à esquerda para editar.
          </div>
        )}
      </div>

      {/* MODAL 1: POST PICKER GALLERY (For Specific Post) */}
      {isPostPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8F9FB]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-100 text-pink-600">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1A1D21]">
                    Galeria de Publicações Conectadas (Instagram & Facebook)
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Selecione um Reel ou Post para ativar o envio de Direct exclusivo.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPostPickerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-[#64748B] hover:text-[#1A1D21] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* URL input or Search */}
            <div className="p-4 border-b border-[#E2E8F0] space-y-3 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPostUrlInput}
                  onChange={(e) => setCustomPostUrlInput(e.target.value)}
                  placeholder="Ou cole aqui o link direto do Post/Reel (ex: https://instagram.com/reel/C8qL9z...)"
                  className="flex-1 px-3 py-2 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
                />
                <button
                  onClick={handleSelectPostByUrl}
                  className="px-4 py-2 bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Vincular Link
                </button>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {metaPosts.map((post) => {
                const isCurrentSelected = selectedTool?.postId === post.id;
                return (
                  <div
                    key={post.id}
                    onClick={() => handleSelectPost(post)}
                    className={`rounded-xl border overflow-hidden cursor-pointer transition-all flex flex-col justify-between ${
                      isCurrentSelected
                        ? 'border-pink-500 ring-2 ring-pink-500/20 shadow-md'
                        : 'border-[#E2E8F0] hover:border-gray-300 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    <div className="relative aspect-video sm:aspect-square bg-gray-100">
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold uppercase flex items-center gap-1">
                        {post.type === 'reel' ? <Film className="w-3 h-3 text-pink-400" /> : <ImageIcon className="w-3 h-3 text-blue-400" />}
                        <span>{post.type}</span>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold">
                        💬 {post.commentsCount}
                      </div>
                    </div>

                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between bg-white">
                      <p className="text-xs font-medium text-[#1A1D21] line-clamp-2">
                        {post.caption}
                      </p>

                      <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[10px] text-[#64748B]">
                        <span>{post.accountHandle}</span>
                        <span className="font-bold text-pink-600">
                          {isCurrentSelected ? '✓ Selecionado' : 'Selecionar'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE NEW COMMENT AUTOMATION RULE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8F9FB]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-100 text-pink-600">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1A1D21]">
                    Criar Nova Automação de Comentário
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Defina se a regra vale para Todos os Posts ou Post Único e aplique nas páginas desejadas.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-[#64748B] hover:text-[#1A1D21] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A1D21] uppercase">
                  Título da Regra
                </label>
                <input
                  type="text"
                  value={newRuleTitle}
                  onChange={(e) => setNewRuleTitle(e.target.value)}
                  placeholder="Ex: Campanha Cupom 20% (Todos os Posts)"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
                />
              </div>

              {/* Scope Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1A1D21] uppercase">
                  Escopo: Onde aplicar a automação?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setNewRuleScope('all_posts')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      newRuleScope === 'all_posts'
                        ? 'border-[#0084FF] bg-blue-50/50'
                        : 'border-[#E2E8F0] hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#0084FF]" />
                      <span className="font-bold text-xs text-[#1A1D21]">Todos os Posts</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Qualquer Reel ou post atual e futuro.
                    </p>
                  </div>

                  <div
                    onClick={() => setNewRuleScope('specific_post')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      newRuleScope === 'specific_post'
                        ? 'border-pink-500 bg-pink-50/50'
                        : 'border-[#E2E8F0] hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-pink-600" />
                      <span className="font-bold text-xs text-[#1A1D21]">Post Único</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Apenas um Reel ou post selecionado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Apply to All Pages Quick Checkbox */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-emerald-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRuleApplyAllPages}
                    onChange={(e) => setNewRuleApplyAllPages(e.target.checked)}
                    className="rounded accent-emerald-600 w-4 h-4"
                  />
                  <span>⚡ Aplicar a TODAS as {connectedAccounts.length} Páginas & Perfis Conectados</span>
                </label>
                <p className="text-[11px] text-emerald-800">
                  Sincroniza automaticamente a regra no Instagram Oficial, Instagram Academy e páginas do Facebook.
                </p>
              </div>

              {/* Keywords */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A1D21] uppercase">
                  Palavras-Chave Gatilho (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={newRuleKeywords.join(', ')}
                  onChange={(e) => setNewRuleKeywords(e.target.value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean))}
                  placeholder="QUERO, CUPOM, LINK, AULA..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
                />
              </div>

              {/* Target Flow */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A1D21] uppercase">
                  Fluxo Enviado no Direct
                </label>
                <select
                  value={newRuleTargetFlowId}
                  onChange={(e) => setNewRuleTargetFlowId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#0084FF] font-bold"
                >
                  {flows.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E2E8F0] bg-[#F8F9FB] flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1A1D21] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateRuleSubmit}
                className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Criar Automação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
