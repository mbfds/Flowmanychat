import React, { useState } from 'react';
import { 
  X, 
  Tag as TagIcon, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  Users, 
  Layers, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Contact } from '../../types';

interface BulkTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContacts: Contact[];
  availableTags: string[];
  onApplyTags: (tagsToAdd: string[], tagsToRemove: string[]) => void;
}

const PRESET_SUGGESTIONS = [
  'Lead-Qualificado',
  'Interesse-VIP',
  'Comprador-Ativo',
  'FollowUp-Pendente',
  'Black-Friday-2026',
  'Carrinho-Abandonado',
  'Lead-Quente',
  'Atendimento-Humano'
];

export const BulkTagModal: React.FC<BulkTagModalProps> = ({
  isOpen,
  onClose,
  selectedContacts,
  availableTags,
  onApplyTags
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [tagsToAdd, setTagsToAdd] = useState<string[]>([]);
  const [tagsToRemove, setTagsToRemove] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Combine available tags with preset suggestions
  const allSuggestedTags = Array.from(new Set([...availableTags, ...PRESET_SUGGESTIONS]));

  const handleAddNewTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (mode === 'add') {
      if (!tagsToAdd.includes(trimmed)) {
        setTagsToAdd((prev) => [...prev, trimmed]);
      }
    } else {
      if (!tagsToRemove.includes(trimmed)) {
        setTagsToRemove((prev) => [...prev, trimmed]);
      }
    }
    setNewTagInput('');
  };

  const handleToggleTag = (tag: string) => {
    if (mode === 'add') {
      if (tagsToAdd.includes(tag)) {
        setTagsToAdd((prev) => prev.filter((t) => t !== tag));
      } else {
        setTagsToAdd((prev) => [...prev, tag]);
      }
    } else {
      if (tagsToRemove.includes(tag)) {
        setTagsToRemove((prev) => prev.filter((t) => t !== tag));
      } else {
        setTagsToRemove((prev) => [...prev, tag]);
      }
    }
  };

  const handleConfirm = () => {
    if (tagsToAdd.length === 0 && tagsToRemove.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      onApplyTags(tagsToAdd, tagsToRemove);
      setIsProcessing(false);
      onClose();
    }, 350);
  };

  return (
    <div 
      id="bulk_tag_modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <TagIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Gerenciar Tags em Massa</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white border border-white/30">
                  {selectedContacts.length} contatos
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Adicione ou remova etiquetas simultaneamente para segmentar o CRM.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 bg-[#F8F9FB]">
          {/* Mode Switch Tabs */}
          <div className="flex items-center p-1 bg-gray-200/70 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('add')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'add'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Tags ({tagsToAdd.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('remove')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'remove'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remover Tags ({tagsToRemove.length})</span>
            </button>
          </div>

          {/* New Tag Input Form */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
              {mode === 'add' ? 'Digite uma Nova Tag ou Escolha Abaixo:' : 'Escolha a Tag a ser Removida da Seleção:'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNewTag(newTagInput);
                  }
                }}
                placeholder={mode === 'add' ? 'Ex: VIP-WhatsApp, Comprador-2026...' : 'Nome da tag a remover...'}
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleAddNewTag(newTagInput)}
                disabled={!newTagInput.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Incluir
              </button>
            </div>
          </div>

          {/* Selected Tags for Action */}
          {mode === 'add' && tagsToAdd.length > 0 && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                Tags que serão aplicadas ({tagsToAdd.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tagsToAdd.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-2xs"
                  >
                    <span>🏷️ {t}</span>
                    <button
                      type="button"
                      onClick={() => setTagsToAdd((prev) => prev.filter((item) => item !== t))}
                      className="hover:text-emerald-200 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {mode === 'remove' && tagsToRemove.length > 0 && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
              <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider block">
                Tags que serão removidas ({tagsToRemove.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tagsToRemove.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold shadow-2xs"
                  >
                    <span>🗑️ {t}</span>
                    <button
                      type="button"
                      onClick={() => setTagsToRemove((prev) => prev.filter((item) => item !== t))}
                      className="hover:text-rose-200 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tag Quick Cloud Suggestions */}
          <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tags Existentes & Sugestões:</span>
              </span>
              <span className="text-[10px] text-gray-500">Clique para alternar</span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
              {allSuggestedTags.map((tag) => {
                const isSelected = mode === 'add' ? tagsToAdd.includes(tag) : tagsToRemove.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? mode === 'add'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-2 ring-emerald-200'
                          : 'bg-rose-100 text-rose-900 border-rose-400 ring-2 ring-rose-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <span>{isSelected ? (mode === 'add' ? '✓' : '✗') : '+'}</span>
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            id="btn_confirm_bulk_tags"
            type="button"
            onClick={handleConfirm}
            disabled={(tagsToAdd.length === 0 && tagsToRemove.length === 0) || isProcessing}
            className={`py-2.5 px-5 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
              mode === 'add'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700'
            }`}
          >
            {isProcessing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Aplicando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Salvar Tags ({selectedContacts.length} Contatos)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
