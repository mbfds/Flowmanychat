import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Search, 
  Check, 
  ArrowRight, 
  Instagram, 
  Facebook, 
  MessageSquare, 
  Layers, 
  TrendingUp, 
  Zap, 
  Tag, 
  Play,
  Copy,
  Sliders,
  DollarSign,
  Share2,
  BookOpen,
  ShoppingBag,
  Flame,
  Globe
} from 'lucide-react';
import { Flow } from '../../types';
import { FLOW_TEMPLATES, FlowTemplate } from '../../data/flowTemplates';

interface FlowTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (flow: Flow) => void;
  onOpenAIGenerator: () => void;
}

export const FlowTemplatesModal: React.FC<FlowTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onOpenAIGenerator
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'influencer' | 'infoproduct' | 'ecommerce' | 'adsense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreviewTemplate, setActivePreviewTemplate] = useState<FlowTemplate | null>(FLOW_TEMPLATES[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Todos os Modelos', icon: Layers, count: FLOW_TEMPLATES.length },
    { id: 'influencer', label: '🌟 Influenciadores & Creators', icon: Share2, count: FLOW_TEMPLATES.filter(t => t.category === 'influencer').length },
    { id: 'infoproduct', label: '💻 Infoprodutos & Cursos', icon: BookOpen, count: FLOW_TEMPLATES.filter(t => t.category === 'infoproduct').length },
    { id: 'ecommerce', label: '🛍️ E-commerce & Produtos', icon: ShoppingBag, count: FLOW_TEMPLATES.filter(t => t.category === 'ecommerce').length },
    { id: 'adsense', label: '📰 AdSense & Portais de Notícias', icon: Globe, count: FLOW_TEMPLATES.filter(t => t.category === 'adsense').length }
  ];

  const filteredTemplates = FLOW_TEMPLATES.filter((tpl) => {
    const matchesCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      tpl.title.toLowerCase().includes(q) || 
      tpl.description.toLowerCase().includes(q) || 
      tpl.tags.some(tag => tag.toLowerCase().includes(q)) ||
      tpl.categoryLabel.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const handleInstall = (template: FlowTemplate) => {
    // Generate a fresh unique ID for the installed flow clone
    const clonedFlow: Flow = {
      ...template.flow,
      id: `flow_${template.id.replace('tpl_', '')}_${Date.now()}`,
      title: template.flow.title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        runs: 0,
        completed: 0,
        ctr: 0
      }
    };
    onSelectTemplate(clonedFlow);
    setCopiedId(template.id);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/50 dark:from-slate-900 dark:to-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Modelos Prontos de Alta Conversão
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white tracking-wide uppercase">
                  1-Clique
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Criados para <strong className="text-blue-600 dark:text-blue-400">Influenciadores</strong>, <strong className="text-indigo-600 dark:text-indigo-400">Venda de Infoprodutos/Cursos</strong>, <strong className="text-emerald-600 dark:text-emerald-400">E-commerce</strong> e <strong className="text-amber-600 dark:text-amber-400">Monetização de AdSense</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn_modal_create_ai_alt"
              onClick={() => {
                onClose();
                onOpenAIGenerator();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gerar com IA</span>
            </button>
            <button
              id="btn_close_flow_templates"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`tab_category_${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input_search_templates"
              type="text"
              placeholder="Buscar por nicho, tag ou canal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Modal Main Content: Split Grid & Live Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Template Cards Grid */}
          <div className="lg:col-span-7 overflow-y-auto p-4 sm:p-5 space-y-3.5 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            {filteredTemplates.length === 0 ? (
              <div className="py-12 text-center">
                <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Nenhum modelo encontrado</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Tente buscar por outro termo ou clique no botão abaixo para gerar com Inteligência Artificial.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAIGenerator();
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Criar com IA Gemini</span>
                </button>
              </div>
            ) : (
              filteredTemplates.map((template) => {
                const isSelected = activePreviewTemplate?.id === template.id;
                const isCopied = copiedId === template.id;

                return (
                  <div
                    key={template.id}
                    id={`card_template_${template.id}`}
                    onClick={() => setActivePreviewTemplate(template)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative bg-white dark:bg-slate-800 ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs'
                    }`}
                  >
                    {/* Header line of card */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1">
                          {template.channel === 'instagram' ? <Instagram className="w-3 h-3 text-pink-500" /> : <Globe className="w-3 h-3 text-blue-500" />}
                          <span className="capitalize">{template.channel === 'instagram' ? 'Instagram' : 'Omnichannel'}</span>
                        </span>
                        
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {template.highlightBadge}
                        </span>
                      </div>

                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                        {template.expectedMetric.split('•')[0]}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1">
                      {template.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {template.description}
                    </p>

                    {/* Tags & Action Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center gap-1 flex-wrap max-w-xs">
                        {template.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{template.tags.length - 3}</span>
                        )}
                      </div>

                      <button
                        id={`btn_use_template_${template.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInstall(template);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-102'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>{isCopied ? 'Instalado!' : 'Usar Modelo'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Live Interactive Details & Node Blueprint */}
          <div className="lg:col-span-5 overflow-y-auto p-5 bg-white dark:bg-slate-900 flex flex-col justify-between">
            {activePreviewTemplate ? (
              <div className="space-y-4">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {activePreviewTemplate.categoryLabel}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {activePreviewTemplate.flow.nodes.length} nós no fluxo
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {activePreviewTemplate.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {activePreviewTemplate.description}
                  </p>
                </div>

                {/* Expected Results Callout */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                      Desempenho Médio Comprovado
                    </div>
                    <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      {activePreviewTemplate.expectedMetric}
                    </div>
                  </div>
                </div>

                {/* Nodes Breakdown Blueprint */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                    <span>Etapas e Mensagens Inclusas:</span>
                    <span className="text-[10px] text-slate-400 font-normal">Pronto para rodar</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    {activePreviewTemplate.flow.nodes.map((node, i) => (
                      <div
                        key={node.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 text-xs">
                            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px]">
                              {i + 1}
                            </span>
                            <span>{node.title}</span>
                          </div>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600 uppercase">
                            {node.type}
                          </span>
                        </div>

                        {node.data?.keywords && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-1 items-center">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">Palavras:</span>
                            {node.data.keywords.map((kw: string, ki: number) => (
                              <span key={ki} className="bg-white dark:bg-slate-700 px-1 py-0.2 rounded font-mono text-[10px] text-blue-600 dark:text-blue-300">
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}

                        {node.data?.text && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800 line-clamp-3">
                            "{node.data.text}"
                          </div>
                        )}

                        {node.data?.buttons && node.data.buttons.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {node.data.buttons.map((btn) => (
                              <span key={btn.id} className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                🔘 {btn.text}
                              </span>
                            ))}
                          </div>
                        )}

                        {node.data?.tagToAdd && (
                          <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            <span>Aplica Tag CRM: "{node.data.tagToAdd}"</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Install Full Action */}
                <div className="pt-3">
                  <button
                    id="btn_install_active_template_full"
                    onClick={() => handleInstall(activePreviewTemplate)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer hover:scale-101"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Instalar Este Modelo no ManyFlow Agora</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-1.5">
                    O fluxo será importado com todos os nós e gatilhos para você editar e testar no celular.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Selecione um modelo à esquerda para ver a prévia.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
