import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  Tag, 
  Trash2, 
  Database, 
  Plus, 
  Check, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  Sparkles, 
  X, 
  Layers, 
  GitFork, 
  ChevronRight, 
  ChevronDown,
  Info,
  Edit3
} from 'lucide-react';
import { Contact, Flow } from '../../types';

interface BulkActionsSidebarProps {
  selectedContacts: Contact[];
  totalFilteredCount: number;
  totalContactsCount: number;
  onClearSelection: () => void;
  onSelectAllFiltered: () => void;
  isAllFilteredSelected: boolean;
  onBulkApplyTags: (tagsToAdd: string[], tagsToRemove: string[]) => void;
  onBulkApplyCustomField: (fieldName: string, fieldValue: string) => void;
  onDeleteSelected: () => void;
  flows?: Flow[];
  onBulkAssignFlow?: (flowId: string) => void;
}

export const BulkActionsSidebar: React.FC<BulkActionsSidebarProps> = ({
  selectedContacts,
  totalFilteredCount,
  totalContactsCount,
  onClearSelection,
  onSelectAllFiltered,
  isAllFilteredSelected,
  onBulkApplyTags,
  onBulkApplyCustomField,
  onDeleteSelected,
  flows = [],
  onBulkAssignFlow
}) => {
  const selectedCount = selectedContacts.length;
  const [activeTab, setActiveTab] = useState<'tags' | 'custom_fields' | 'delete' | 'flow'>('tags');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Tag Tab States
  const [newTagInput, setNewTagInput] = useState('');
  const [tagsToAdd, setTagsToAdd] = useState<string[]>([]);
  const [tagsToRemove, setTagsToRemove] = useState<string[]>([]);

  // Custom Field Tab States
  const [fieldNameInput, setFieldNameInput] = useState('');
  const [fieldValueInput, setFieldValueInput] = useState('');
  const [selectedPresetField, setSelectedPresetField] = useState('');

  // Delete Tab States
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Flow Tab States
  const [selectedFlowId, setSelectedFlowId] = useState(flows[0]?.id || '');

  // Collect all existing tags across all contacts for quick tag suggestions
  const existingTags = useMemo(() => {
    const set = new Set<string>([
      'VIP', 
      'Cliente Ativo', 
      'Novo Lead', 
      'Qualificado', 
      'Demo Agendada', 
      'Interesse Black Friday', 
      'Nutrição Ativa',
      'Follow-up Urgente'
    ]);
    selectedContacts.forEach((c) => {
      c.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [selectedContacts]);

  // Preset custom fields common in CRMs
  const presetCustomFields = [
    { key: 'empresa', label: 'Empresa / Organização', placeholder: 'Ex: Acme Corp' },
    { key: 'cargo', label: 'Cargo / Função', placeholder: 'Ex: Diretor Comercial' },
    { key: 'orcamento', label: 'Orçamento Estimado', placeholder: 'Ex: R$ 10.000 / mês' },
    { key: 'cidade', label: 'Cidade / Região', placeholder: 'Ex: São Paulo, SP' },
    { key: 'origem_campanha', label: 'Origem da Campanha', placeholder: 'Ex: Anúncio Instagram Reels' },
    { key: 'interesse_principal', label: 'Interesse Principal', placeholder: 'Ex: Plano Enterprise' },
    { key: 'etapa_funil', label: 'Etapa do Funil', placeholder: 'Ex: Em Negociação' },
  ];

  const handleToggleAddTag = (tag: string) => {
    if (tagsToAdd.includes(tag)) {
      setTagsToAdd(tagsToAdd.filter((t) => t !== tag));
    } else {
      setTagsToAdd([...tagsToAdd, tag]);
      setTagsToRemove(tagsToRemove.filter((t) => t !== tag));
    }
  };

  const handleToggleRemoveTag = (tag: string) => {
    if (tagsToRemove.includes(tag)) {
      setTagsToRemove(tagsToRemove.filter((t) => t !== tag));
    } else {
      setTagsToRemove([...tagsToRemove, tag]);
      setTagsToAdd(tagsToAdd.filter((t) => t !== tag));
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagInput.trim();
    if (!clean) return;
    if (!tagsToAdd.includes(clean)) {
      setTagsToAdd([...tagsToAdd, clean]);
    }
    setNewTagInput('');
  };

  const handleApplyTags = () => {
    if (tagsToAdd.length === 0 && tagsToRemove.length === 0) return;
    onBulkApplyTags(tagsToAdd, tagsToRemove);
    setTagsToAdd([]);
    setTagsToRemove([]);
  };

  const handleApplyCustomFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const key = (selectedPresetField || fieldNameInput).trim();
    if (!key) return;
    onBulkApplyCustomField(key, fieldValueInput.trim());
    setFieldValueInput('');
    setFieldNameInput('');
    setSelectedPresetField('');
  };

  const handleConfirmDelete = () => {
    onDeleteSelected();
    setShowDeleteConfirmation(false);
  };

  return (
    <aside 
      id="contacts_bulk_actions_sidebar"
      className="w-full lg:w-80 xl:w-96 shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-all duration-200 sticky top-4"
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
            selectedCount > 0 ? 'bg-[#0084FF]' : 'bg-slate-400 dark:bg-slate-700'
          }`}>
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Ações em Massa</span>
              {selectedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {selectedCount}
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Painel persistente para edição em lote
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expandir painel' : 'Recolher painel'}
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Quick Selection Status Banner */}
          <div className="px-4 py-2.5 bg-blue-50/50 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs">
            <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
              {selectedCount > 0 ? (
                <span><strong>{selectedCount}</strong> {selectedCount === 1 ? 'contato selecionado' : 'contatos selecionados'}</span>
              ) : (
                <span className="text-slate-500">Nenhum contato selecionado</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {!isAllFilteredSelected ? (
                <button
                  type="button"
                  id="btn_sidebar_select_all"
                  onClick={onSelectAllFiltered}
                  className="px-2 py-0.5 rounded text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100/60 dark:hover:bg-blue-900/60 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <CheckSquare className="w-3 h-3" />
                  <span>Todos ({totalFilteredCount})</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="btn_sidebar_clear_selection"
                  onClick={onClearSelection}
                  className="px-2 py-0.5 rounded text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Square className="w-3 h-3" />
                  <span>Desmarcar</span>
                </button>
              )}
            </div>
          </div>

          {/* If NO contacts are selected: Informative Guided State */}
          {selectedCount === 0 ? (
            <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-xs">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Selecione Contatos na Tabela
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Marque as caixas de seleção na tabela para habilitar a aplicação imediata de:
                </p>
              </div>

              <div className="w-full space-y-2 text-left text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-[11px]">
                  <Tag className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span><strong>Tags em Lote:</strong> Adicionar ou remover segmentações.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-[11px]">
                  <Database className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span><strong>Campos Personalizados:</strong> Empresa, cargo, etc.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-[11px]">
                  <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span><strong>Exclusão Segura:</strong> Expurgo rápido de múltiplos contatos.</span>
                </div>
              </div>

              <button
                type="button"
                id="btn_sidebar_quick_select_all"
                onClick={onSelectAllFiltered}
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Selecionar todos os {totalFilteredCount} contatos</span>
              </button>
            </div>
          ) : (
            /* Tabbed Actions Panel when Contacts are Selected */
            <div className="flex-1 flex flex-col">
              {/* Tab Navigation */}
              <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-center bg-slate-50/50 dark:bg-slate-900">
                <button
                  type="button"
                  id="tab_bulk_tags"
                  onClick={() => setActiveTab('tags')}
                  className={`py-2.5 px-2 border-b-2 transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'tags'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800/80 font-black'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Tags</span>
                </button>

                <button
                  type="button"
                  id="tab_bulk_custom_fields"
                  onClick={() => setActiveTab('custom_fields')}
                  className={`py-2.5 px-2 border-b-2 transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'custom_fields'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800/80 font-black'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Campos</span>
                </button>

                <button
                  type="button"
                  id="tab_bulk_delete"
                  onClick={() => setActiveTab('delete')}
                  className={`py-2.5 px-2 border-b-2 transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'delete'
                      ? 'border-rose-600 text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800/80 font-black'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              </div>

              {/* Tab 1: TAGS */}
              {activeTab === 'tags' && (
                <div className="p-4 space-y-4 animate-in fade-in duration-150">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Adicionar Nova Tag Personalizada
                    </label>
                    <form onSubmit={handleAddCustomTag} className="flex gap-1.5">
                      <input
                        type="text"
                        id="input_bulk_new_tag"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        placeholder="Ex: Lead-Inbound-2026"
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={!newTagInput.trim()}
                        id="btn_add_tag_to_staging"
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                  {/* Staged Tags Pill Preview */}
                  {(tagsToAdd.length > 0 || tagsToRemove.length > 0) && (
                    <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
                      <div className="text-[10px] font-bold text-blue-900 dark:text-blue-300">
                        Alterações Pendentes:
                      </div>
                      {tagsToAdd.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {tagsToAdd.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300"
                            >
                              + {t}
                              <button
                                type="button"
                                onClick={() => handleToggleAddTag(t)}
                                className="hover:text-emerald-950 cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      {tagsToRemove.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {tagsToRemove.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300"
                            >
                              - {t}
                              <button
                                type="button"
                                onClick={() => handleToggleRemoveTag(t)}
                                className="hover:text-rose-950 cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Tags Suggestions */}
                  <div className="space-y-1.5">
                    <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Tags Sugeridas & Existentes:
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto pr-1">
                      {existingTags.map((tag) => {
                        const isAdded = tagsToAdd.includes(tag);
                        const isRemoved = tagsToRemove.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleToggleAddTag(tag)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                              isAdded
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                                : isRemoved
                                ? 'bg-rose-100 text-rose-800 line-through border-rose-300'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {isAdded ? `✓ ${tag}` : `+ ${tag}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    id="btn_apply_bulk_tags"
                    disabled={tagsToAdd.length === 0 && tagsToRemove.length === 0}
                    onClick={handleApplyTags}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aplicar Tags a {selectedCount} {selectedCount === 1 ? 'Contato' : 'Contatos'}</span>
                  </button>
                </div>
              )}

              {/* Tab 2: CUSTOM FIELDS */}
              {activeTab === 'custom_fields' && (
                <form onSubmit={handleApplyCustomFieldSubmit} className="p-4 space-y-4 animate-in fade-in duration-150">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Selecione um Campo Predefinido
                    </label>
                    <select
                      id="select_preset_custom_field"
                      value={selectedPresetField}
                      onChange={(e) => {
                        setSelectedPresetField(e.target.value);
                        if (e.target.value) {
                          setFieldNameInput('');
                        }
                      }}
                      className="w-full text-xs px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">-- Ou digite um campo customizado abaixo --</option>
                      {presetCustomFields.map((field) => (
                        <option key={field.key} value={field.key}>
                          {field.label} ({field.key})
                        </option>
                      ))}
                    </select>
                  </div>

                  {!selectedPresetField && (
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Nome / Chave do Campo Customizado
                      </label>
                      <input
                        type="text"
                        id="input_bulk_custom_field_name"
                        value={fieldNameInput}
                        onChange={(e) => setFieldNameInput(e.target.value)}
                        placeholder="Ex: segmento_mercado, crm_id"
                        className="w-full text-xs px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Valor a Atribuir para os {selectedCount} Contatos
                    </label>
                    <input
                      type="text"
                      id="input_bulk_custom_field_value"
                      required
                      value={fieldValueInput}
                      onChange={(e) => setFieldValueInput(e.target.value)}
                      placeholder={
                        presetCustomFields.find((f) => f.key === selectedPresetField)?.placeholder ||
                        'Ex: Informática, VIP, R$ 5.000...'
                      }
                      className="w-full text-xs px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-start gap-2 text-[11px] text-indigo-900 dark:text-indigo-300">
                    <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      O valor inserido será gravado na propriedade <code>customFields</code> de todos os {selectedCount} contatos e logado no histórico.
                    </span>
                  </div>

                  <button
                    type="submit"
                    id="btn_apply_bulk_custom_field"
                    disabled={(!selectedPresetField && !fieldNameInput.trim()) || !fieldValueInput.trim()}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Gravar Campo em {selectedCount} Contatos</span>
                  </button>
                </form>
              )}

              {/* Tab 3: DELETE */}
              {activeTab === 'delete' && (
                <div className="p-4 space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-900 dark:text-rose-200">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Exclusão em Massa de Contatos</span>
                    </div>
                    <p className="text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed">
                      Você selecionou <strong>{selectedCount}</strong> {selectedCount === 1 ? 'contato' : 'contatos'}. Esta ação removerá os registros da base ativa do CRM.
                    </p>
                  </div>

                  {!showDeleteConfirmation ? (
                    <button
                      type="button"
                      id="btn_request_delete_selected"
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir {selectedCount} {selectedCount === 1 ? 'Contato' : 'Contatos'}</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 space-y-3">
                      <p className="text-xs font-bold text-slate-800 dark:text-white text-center">
                        Tem certeza absoluta?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirmation(false)}
                          className="flex-1 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          id="btn_confirm_delete_selected"
                          onClick={handleConfirmDelete}
                          className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Sim, Excluir
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </aside>
  );
};
