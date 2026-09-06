import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sliders, 
  Variable, 
  Plus, 
  Copy, 
  Check, 
  Search, 
  Clock, 
  DollarSign, 
  Globe, 
  Mail, 
  Phone, 
  Link as LinkIcon, 
  Shield, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Sparkles, 
  MessageSquare, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Eye,
  Info,
  Calendar,
  Zap,
  Save,
  Tag
} from 'lucide-react';
import { SystemVariable } from '../../types';
import { 
  getSystemVariables, 
  saveSystemVariables, 
  resetSystemVariables, 
  interpolateSystemVariables,
  getSystemVariableTag 
} from '../../utils/systemVariables';

export const SystemVariablesManager: React.FC = () => {
  const [variables, setVariables] = useState<SystemVariable[]>(() => getSystemVariables());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentVarId, setCurrentVarId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Modal Form State
  const [formKey, setFormKey] = useState('');
  const [formName, setFormName] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formCategory, setFormCategory] = useState<SystemVariable['category']>('operations');
  const [formType, setFormType] = useState<SystemVariable['type']>('text');
  const [formDescription, setFormDescription] = useState('');

  // Interactive Flow Simulator State
  const [simulationText, setSimulationText] = useState(
    'Olá! Seja bem-vindo à {{system.company_name}} ✨\nNosso horário de atendimento é {{system.business_hours}} (Fuso: {{system.timezone}}).\nTodos os orçamentos e faturas são em {{system.default_currency}}.\nQualquer dúvida, envie um e-mail para {{system.support_email}} ou agende sua conversa em {{system.booking_link}}!'
  );

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleCopyTag = (key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const tag = `{{system.${key}}}`;
    navigator.clipboard.writeText(tag);
    setCopiedKey(key);
    showToast(`Tag ${tag} copiada para a área de transferência!`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Quick inline edit
  const handleStartInlineEdit = (v: SystemVariable) => {
    setEditingId(v.id);
    setEditValue(v.value);
  };

  const handleSaveInlineEdit = (id: string) => {
    const updated = variables.map((v) => {
      if (v.id === id) {
        return {
          ...v,
          value: editValue.trim(),
          updatedAt: new Date().toISOString()
        };
      }
      return v;
    });
    setVariables(updated);
    saveSystemVariables(updated);
    setEditingId(null);
    showToast('Valor da variável atualizado com sucesso!', 'success');
  };

  const handleCancelInlineEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  // Open Modal for Create or Full Edit
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setCurrentVarId(null);
    setFormKey('');
    setFormName('');
    setFormValue('');
    setFormCategory('operations');
    setFormType('text');
    setFormDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v: SystemVariable) => {
    setModalMode('edit');
    setCurrentVarId(v.id);
    setFormKey(v.key);
    setFormName(v.name);
    setFormValue(v.value);
    setFormCategory(v.category);
    setFormType(v.type);
    setFormDescription(v.description || '');
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedKey = formKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

    if (!formattedKey || !formName.trim() || !formValue.trim()) {
      showToast('Preencha os campos obrigatórios.', 'warning');
      return;
    }

    if (modalMode === 'create') {
      // Check duplicate key
      if (variables.some((v) => v.key === formattedKey)) {
        showToast(`A chave "system.${formattedKey}" já está em uso.`, 'warning');
        return;
      }

      const newVar: SystemVariable = {
        id: `sys_var_${Date.now()}`,
        key: formattedKey,
        name: formName.trim(),
        value: formValue.trim(),
        category: formCategory,
        type: formType,
        description: formDescription.trim(),
        isSystemDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const nextList = [...variables, newVar];
      setVariables(nextList);
      saveSystemVariables(nextList);
      showToast(`Variável {{system.${formattedKey}}} criada com sucesso!`, 'success');
    } else if (modalMode === 'edit' && currentVarId) {
      const nextList = variables.map((v) => {
        if (v.id === currentVarId) {
          return {
            ...v,
            name: formName.trim(),
            value: formValue.trim(),
            category: formCategory,
            type: formType,
            description: formDescription.trim(),
            updatedAt: new Date().toISOString()
          };
        }
        return v;
      });
      setVariables(nextList);
      saveSystemVariables(nextList);
      showToast(`Variável atualizada com sucesso!`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    const target = variables.find((v) => v.id === id);
    if (!target) return;

    if (target.isSystemDefault) {
      showToast('Esta variável faz parte do núcleo do sistema e não pode ser excluída.', 'warning');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir a variável "${name}"? Fluxos que utilizam {{system.${target.key}}} perderão essa referência.`)) {
      const nextList = variables.filter((v) => v.id !== id);
      setVariables(nextList);
      saveSystemVariables(nextList);
      showToast(`Variável "${name}" excluída.`, 'info');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Deseja restaurar as variáveis de sistema para as definições originais de fábrica? Variáveis customizadas serão removidas.')) {
      const defaults = resetSystemVariables();
      setVariables(defaults);
      showToast('Variáveis de sistema restauradas para o padrão de fábrica.', 'success');
    }
  };

  // Filtered variables
  const filteredVariables = useMemo(() => {
    return variables.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.key.toLowerCase().includes(search.toLowerCase()) ||
        v.value.toLowerCase().includes(search.toLowerCase()) ||
        (v.description && v.description.toLowerCase().includes(search.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || v.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [variables, search, selectedCategory]);

  // Interpolated simulation preview
  const interpolatedSimulation = useMemo(() => {
    return interpolateSystemVariables(simulationText, variables);
  }, [simulationText, variables]);

  const getCategoryBadge = (cat: SystemVariable['category']) => {
    switch (cat) {
      case 'operations':
        return { label: 'Operação & Atendimento', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'finance':
        return { label: 'Finanças & Moeda', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'contact':
        return { label: 'Canais & Contato', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'brand':
        return { label: 'Marca & Empresa', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      default:
        return { label: 'Personalizada', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  const getTypeIcon = (type: SystemVariable['type']) => {
    switch (type) {
      case 'time_range':
        return <Clock className="w-3.5 h-3.5 text-blue-600" />;
      case 'currency':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-600" />;
      case 'timezone':
        return <Globe className="w-3.5 h-3.5 text-indigo-600" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-purple-600" />;
      case 'phone':
        return <Phone className="w-3.5 h-3.5 text-pink-600" />;
      case 'url':
        return <LinkIcon className="w-3.5 h-3.5 text-cyan-600" />;
      default:
        return <Variable className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div id="system_variables_manager" className="space-y-6">
      {/* Toast */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold">{feedbackToast.message}</span>
          <button 
            onClick={() => setFeedbackToast(null)}
            className="text-slate-400 hover:text-white cursor-pointer ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xs shrink-0 mt-0.5">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900">
                Variáveis Globais do Sistema
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">
                Automação & Fluxos
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Sincronizado
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Defina valores globais da sua operação (horário de atendimento, fuso horário, moeda padrão, dados de suporte e marca) que podem ser reutilizados em mensagens, blocos de condição e nós de IA em qualquer fluxo usando a tag <code className="bg-white/80 border border-blue-200 px-1.5 py-0.5 rounded font-mono text-blue-700 font-bold text-[11px]">{`{{system.nome_variavel}}`}</code>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0 flex-wrap">
          <button
            id="btn_reset_system_variables"
            onClick={handleResetDefaults}
            className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Restaurar variáveis padrão de fábrica"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Restaurar Padrões</span>
          </button>

          <button
            id="btn_create_system_variable"
            onClick={handleOpenCreateModal}
            className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Variável Global</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Todas as Variáveis', count: variables.length },
              { id: 'operations', label: 'Operação & Atendimento', count: variables.filter((v) => v.category === 'operations').length },
              { id: 'finance', label: 'Finanças & Moeda', count: variables.filter((v) => v.category === 'finance').length },
              { id: 'contact', label: 'Canais & Contato', count: variables.filter((v) => v.category === 'contact').length },
              { id: 'brand', label: 'Marca & Empresa', count: variables.filter((v) => v.category === 'brand').length },
              { id: 'custom', label: 'Personalizadas', count: variables.filter((v) => v.category === 'custom').length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCategory === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  selectedCategory === tab.id ? 'bg-blue-800/60 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, tag ou valor..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Variables Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredVariables.map((v) => {
          const badge = getCategoryBadge(v.category);
          const isInlineEditing = editingId === v.id;

          return (
            <div
              key={v.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 hover:shadow-sm"
            >
              <div className="space-y-3">
                {/* Card Top: Badges & Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${badge.color}`}>
                      {getTypeIcon(v.type)}
                      <span>{badge.label}</span>
                    </span>
                    {v.isSystemDefault ? (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200 flex items-center gap-1">
                        <Shield className="w-2.5 h-2.5 text-slate-500" />
                        Padrão
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                        Custom
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(v)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Configuração detalhada"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {!v.isSystemDefault && (
                      <button
                        type="button"
                        onClick={() => handleDelete(v.id, v.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Excluir variável"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Variable Name and Key Tag */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {v.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={(e) => handleCopyTag(v.key, e)}
                      className="group px-2 py-1 rounded-md bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 font-mono text-[11px] font-bold text-blue-700 transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Clique para copiar a tag de interpolação"
                    >
                      <span>{getSystemVariableTag(v.key)}</span>
                      {copiedKey === v.key ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Description */}
                {v.description && (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {v.description}
                  </p>
                )}
              </div>

              {/* Current Value / Inline Editor */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Valor Atual nos Fluxos
                </span>

                {isInlineEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border-2 border-blue-500 text-xs font-semibold text-slate-900 focus:outline-none"
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={handleCancelInlineEdit}
                        className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveInlineEdit(v.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Save className="w-3 h-3" />
                        <span>Salvar</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => handleStartInlineEdit(v)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-xs font-semibold text-slate-900 transition-all cursor-pointer flex items-center justify-between group"
                    title="Clique para editar este valor rapidamente"
                  >
                    <span className="truncate pr-2">{v.value}</span>
                    <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center gap-1">
                      <Edit3 className="w-3 h-3" />
                      Editar
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredVariables.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <Variable className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Nenhuma variável global encontrada</p>
            <p className="text-xs text-slate-500 mt-1">Tente ajustar o termo de busca ou selecione outra categoria.</p>
          </div>
        )}
      </div>

      {/* Interactive Automation Flow Interpolation Simulator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Simulador de Variáveis nos Fluxos de Automação
              </h3>
              <p className="text-xs text-slate-500">
                Veja em tempo real como o texto configurado nos seus nós de mensagem será recebido pelo seguidor no direct.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Interpolação Ativa
          </span>
        </div>

        {/* Quick Insert Variable Tags Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
            <span>Clique para inserir variável no teste:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {variables.slice(0, 8).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setSimulationText((prev) => `${prev} {{system.${v.key}}}`);
                }}
                className="px-2 py-1 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 hover:text-blue-700 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                title={`Inserir {{system.${v.key}}}`}
              >
                <span>+</span>
                <span>{`{{system.${v.key}}}`}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Two Columns: Input and Live Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Template do Fluxo (com tags):
            </label>
            <textarea
              rows={6}
              value={simulationText}
              onChange={(e) => setSimulationText(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Digite aqui o texto do bot com tags como {{system.business_hours}}..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center justify-between">
              <span>Resultado Entregue ao Usuário (Interpolado):</span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" />
                Variáveis Resolvidas
              </span>
            </label>
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 font-sans text-xs leading-relaxed min-h-[148px] max-h-[160px] overflow-y-auto whitespace-pre-wrap shadow-inner border border-slate-700">
              {interpolatedSimulation || <span className="text-slate-400 italic">O resultado aparecerá aqui...</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Create or Edit Variable */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {modalMode === 'create' ? 'Nova Variável Global do Sistema' : 'Editar Variável Global'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {modalMode === 'create' 
                      ? 'Crie uma variável acessível globalmente em automações e fluxos.' 
                      : 'Modifique os detalhes desta variável do sistema.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Amigável da Variável *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (modalMode === 'create' && !formKey) {
                      setFormKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
                    }
                  }}
                  placeholder="Ex: Horário de Almoço da Equipe"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              {/* Key Tag */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Identificador / Chave Única (slug) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400 select-none">
                    system.
                  </span>
                  <input
                    type="text"
                    value={formKey}
                    disabled={modalMode === 'edit'}
                    onChange={(e) => setFormKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                    placeholder="horario_almoco"
                    className="w-full pl-18 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Nos fluxos de mensagem, a tag será: <code className="font-mono text-blue-700 font-bold">{`{{system.${formKey || 'sua_chave'}}}`}</code>
                </p>
              </div>

              {/* Category & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="operations">Operação & Atendimento</option>
                    <option value="finance">Finanças & Moeda</option>
                    <option value="contact">Canais & Contato</option>
                    <option value="brand">Marca & Empresa</option>
                    <option value="custom">Personalizada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Dado *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="text">Texto Simples</option>
                    <option value="time_range">Intervalo de Horário</option>
                    <option value="currency">Moeda / Preço</option>
                    <option value="timezone">Fuso Horário</option>
                    <option value="email">E-mail</option>
                    <option value="phone">Telefone / WhatsApp</option>
                    <option value="url">Link / URL</option>
                    <option value="number">Número</option>
                  </select>
                </div>
              </div>

              {/* Value */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Valor Padrão da Variável *
                </label>
                <input
                  type="text"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="Ex: Segunda a Sexta das 12h às 13h"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descrição ou Objetivo (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Descreva quando e onde essa variável é indicada para uso..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{modalMode === 'create' ? 'Cadastrar Variável' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
