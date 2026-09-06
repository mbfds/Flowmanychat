import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Image as ImageIcon, 
  Video, 
  Layers, 
  Sparkles, 
  Send, 
  Trash2, 
  Check, 
  AlertCircle, 
  HelpCircle, 
  MessageSquareReply, 
  Instagram, 
  Facebook, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { 
  PostizScheduledPost, 
  PostizSocialAccount, 
  PostizSocialPlatform, 
  PostizPostType,
  PostCommentGrowthTool 
} from '../../types';

interface PostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: PostizScheduledPost) => void;
  accounts: PostizSocialAccount[];
  growthTools?: PostCommentGrowthTool[];
  initialPost?: PostizScheduledPost | null;
}

export const PostComposerModal: React.FC<PostComposerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accounts,
  growthTools = [],
  initialPost
}) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<PostizSocialPlatform[]>(
    initialPost?.platforms || ['instagram', 'facebook']
  );
  const [postType, setPostType] = useState<PostizPostType>(initialPost?.postType || 'post');
  const [caption, setCaption] = useState(initialPost?.caption || '');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>(
    initialPost?.mediaUrls || [
      'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80'
    ]
  );
  const [firstComment, setFirstComment] = useState(initialPost?.firstComment || '');
  const [bindGrowthToolId, setBindGrowthToolId] = useState<string>(
    initialPost?.bindGrowthToolId || ''
  );
  const [tagsInput, setTagsInput] = useState((initialPost?.tags || []).join(', '));
  
  // Date & Time
  const defaultDate = initialPost?.scheduledAt 
    ? new Date(initialPost.scheduledAt).toISOString().split('T')[0]
    : new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const defaultTime = initialPost?.scheduledAt 
    ? new Date(initialPost.scheduledAt).toTimeString().slice(0, 5)
    : '18:00';

  const [scheduleDate, setScheduleDate] = useState(defaultDate);
  const [scheduleTime, setScheduleTime] = useState(defaultTime);
  const [saveAsDraft, setSaveAsDraft] = useState(initialPost?.status === 'draft');

  if (!isOpen) return null;

  const togglePlatform = (p: PostizSocialPlatform) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleAddMedia = () => {
    if (mediaUrlInput.trim()) {
      setMediaUrls([...mediaUrls, mediaUrlInput.trim()]);
      setMediaUrlInput('');
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && mediaUrls.length === 0) return;

    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const postData: PostizScheduledPost = {
      id: initialPost?.id || `post_postiz_${Date.now()}`,
      caption,
      mediaUrls,
      mediaType: mediaUrls.length > 1 ? 'mixed' : mediaUrls.length === 1 ? 'image' : 'text_only',
      platforms: selectedPlatforms,
      postType,
      scheduledAt: scheduledDateTime,
      status: saveAsDraft ? 'draft' : 'scheduled',
      firstComment: firstComment.trim() || undefined,
      bindGrowthToolId: bindGrowthToolId || undefined,
      tags: parsedTags,
      createdAt: initialPost?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(postData);
    onClose();
  };

  const sampleMediaPresets = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                {initialPost ? 'Editar Publicação Agendada' : 'Novo Post no Postiz Planner'}
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                  gitroomhq/postiz-app
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Agende posts multicanal e ative respostas automáticas em Directs nos comentários
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Form, Right Preview */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
          {/* Left Column: Form Settings (7 cols) */}
          <div className="lg:col-span-7 p-6 space-y-5">
            {/* 1. Target Platforms */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                1. Selecione os Canais de Destino
              </label>
              <div className="flex flex-wrap gap-2">
                {accounts.map((acc) => {
                  const isSelected = selectedPlatforms.includes(acc.platform);
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => togglePlatform(acc.platform)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-50 border-purple-400 text-purple-900 dark:bg-purple-950/40 dark:border-purple-600 dark:text-purple-200 shadow-xs'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={acc.avatarUrl}
                        alt={acc.displayName}
                        className="w-5 h-5 rounded-full object-cover border border-slate-300"
                      />
                      <span className="capitalize">{acc.platform}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Post Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                2. Formato da Publicação
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'post' as PostizPostType, label: 'Feed Post', icon: ImageIcon },
                  { id: 'reel' as PostizPostType, label: 'Reel / Vídeo', icon: Video },
                  { id: 'carousel' as PostizPostType, label: 'Carrossel', icon: Layers },
                  { id: 'story' as PostizPostType, label: 'Stories', icon: Sparkles }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = postType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPostType(item.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 dark:bg-indigo-950/50 dark:border-indigo-500 dark:text-indigo-200'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Caption Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  3. Legenda & Texto do Post
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {caption.length} caracteres
                </span>
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                placeholder="Escreva a legenda do post... Use #hashtags e chamadas para ação como: 'Comente PREÇO para receber o link no Direct!'"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-y"
              />
            </div>

            {/* 4. Media URLs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                4. Imagens ou Vídeos (URLs)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={mediaUrlInput}
                  onChange={(e) => setMediaUrlInput(e.target.value)}
                  placeholder="Cole a URL da imagem/vídeo ou selecione um preset..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddMedia}
                  className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </button>
              </div>

              {/* Media Previews list */}
              {mediaUrls.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {mediaUrls.map((url, idx) => (
                    <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                      <img src={url} alt={`Media ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(idx)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. ManyFlow Synergy: Auto-bind Comment Growth Tool */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-900/50 space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquareReply className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wide">
                  Gatilho Automático ManyFlow (Comentário ➔ Direct)
                </span>
              </div>
              <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                Ao publicar este post via Postiz, o ManyFlow ativará automaticamente uma resposta nos Directs para quem comentar!
              </p>
              <select
                value={bindGrowthToolId}
                onChange={(e) => setBindGrowthToolId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="">Nenhuma automação vinculada</option>
                {growthTools.map((gt) => (
                  <option key={gt.id} value={gt.id}>
                    ⚡ {gt.title} ({gt.triggerKeywords.length > 0 ? gt.triggerKeywords.join(', ') : 'Qualquer comentário'})
                  </option>
                ))}
              </select>
            </div>

            {/* 6. First Comment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Primeiro Comentário Automático (Opcional)
              </label>
              <input
                type="text"
                value={firstComment}
                onChange={(e) => setFirstComment(e.target.value)}
                placeholder="Ex: Comente 'QUERO' para receber os materiais no seu direct! 👇"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* 7. Schedule Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Data de Publicação
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Horário
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Live Mock Preview (5 cols) */}
          <div className="lg:col-span-5 p-6 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Pré-visualização do Feed
                </span>
                <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                  {postType.toUpperCase()}
                </span>
              </div>

              {/* Instagram Card Preview */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden max-w-sm mx-auto">
                {/* Post Header */}
                <div className="p-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <img
                      src={accounts[0]?.avatarUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {accounts[0]?.username || 'manyflow.automacoes'}
                      </div>
                      <div className="text-[10px] text-slate-400">Patrocinado • São Paulo</div>
                    </div>
                  </div>
                  <Instagram className="w-4 h-4 text-slate-400" />
                </div>

                {/* Post Media */}
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                  {mediaUrls.length > 0 ? (
                    <img
                      src={mediaUrls[0]}
                      alt="Post Media"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6 text-slate-400">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Sem mídia visual selecionada</p>
                    </div>
                  )}
                  {mediaUrls.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      1/{mediaUrls.length}
                    </div>
                  )}
                </div>

                {/* Post Caption & Comments */}
                <div className="p-3.5 space-y-2">
                  <div className="text-xs text-slate-800 dark:text-slate-200 line-clamp-3">
                    <span className="font-bold mr-1.5">{accounts[0]?.username || 'manyflow'}:</span>
                    {caption || 'Escreva a sua legenda para visualizar aqui...'}
                  </div>

                  {firstComment && (
                    <div className="text-[11px] text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 p-2 rounded-lg border border-purple-100 dark:border-purple-900">
                      <span className="font-bold">1º Comentário:</span> {firstComment}
                    </div>
                  )}

                  {bindGrowthToolId && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                      <Check className="w-3 h-3" />
                      Resposta direta ativada no direct via ManyFlow
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 flex items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 mt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveAsDraft}
                  onChange={(e) => setSaveAsDraft(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Salvar como Rascunho
                </span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {saveAsDraft ? 'Salvar Rascunho' : 'Agendar Post no Postiz'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
