import React, { useState } from 'react';
import { 
  X, 
  StickyNote, 
  Sparkles, 
  Users, 
  Check, 
  User, 
  Tag as TagIcon, 
  Clock, 
  MessageSquare,
  Pin
} from 'lucide-react';
import { Contact, ContactNote } from '../../types';

interface BulkAddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContacts: Contact[];
  onAddNote: (note: Omit<ContactNote, 'id' | 'createdAt'>) => void;
}

const CATEGORY_MAP: Record<string, { label: string; bg: string; text: string; border: string; icon: string }> = {
  general: { label: 'Geral', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: '📝' },
  sales: { label: 'Vendas & Negociação', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: '💼' },
  support: { label: 'Suporte & Atendimento', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', icon: '🎧' },
  important: { label: 'Alta Prioridade', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', icon: '🚨' },
  followup: { label: 'Follow-up Agendado', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: '⏰' }
};

const TEAM_MEMBERS = [
  'Lucas Santos (Vendas)',
  'Ana Beatriz (Customer Success)',
  'Carlos Menezes (Comercial)',
  'Juliana Rocha (Suporte)',
  'Admin Geral'
];

const QUICK_SNIPPETS = [
  'Campanha Promocional Disparada via CRM',
  'Lead qualificado para contato telefônico/WhatsApp',
  'Contato reativado em ação de engajamento',
  'Aguardando confirmação de pagamento/pedido',
  'Enviada proposta comercial com desconto de 20%'
];

export const BulkAddNoteModal: React.FC<BulkAddNoteModalProps> = ({
  isOpen,
  onClose,
  selectedContacts,
  onAddNote
}) => {
  if (!isOpen) return null;

  const [content, setContent] = useState('');
  const [author, setAuthor] = useState(TEAM_MEMBERS[0].split(' (')[0]);
  const [category, setCategory] = useState<'general' | 'sales' | 'support' | 'important' | 'followup'>('general');
  const [isPinned, setIsPinned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = () => {
    if (!content.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      onAddNote({
        author,
        content: content.trim(),
        category,
        isPinned
      });
      setIsProcessing(false);
      onClose();
    }, 300);
  };

  return (
    <div 
      id="bulk_add_note_modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <StickyNote className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Adicionar Nota Interna em Lote</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white border border-white/30">
                  {selectedContacts.length} contatos
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                Insere uma observação corporativa no histórico de todos os leads selecionados.
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
          {/* Author & Category Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Atendente / Autor:
              </label>
              <select
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-[#E2E8F0] text-xs font-semibold text-[#1A1D21] focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {TEAM_MEMBERS.map((m) => {
                  const name = m.split(' (')[0];
                  return (
                    <option key={name} value={name}>
                      👤 {m}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Categoria da Nota:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-white border border-[#E2E8F0] text-xs font-semibold text-[#1A1D21] focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {Object.entries(CATEGORY_MAP).map(([catKey, catVal]) => (
                  <option key={catKey} value={catKey}>
                    {catVal.icon} {catVal.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Snippets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-amber-500" />
              <span>Modelos Rápidos (Clique para Usar):</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SNIPPETS.map((snip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setContent(snip)}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-white hover:bg-amber-50 border border-gray-200 hover:border-amber-300 text-gray-700 hover:text-amber-800 transition-colors text-left cursor-pointer"
                >
                  ⚡ {snip}
                </button>
              ))}
            </div>
          </div>

          {/* Note Content Textarea */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
              Conteúdo da Nota:
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva a anotação para a equipe..."
              className="w-full p-3 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
            />
          </div>

          {/* Pin Toggle */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
              <Pin className="w-3.5 h-3.5 text-amber-600" />
              <span>Fixar esta nota no topo do perfil de cada lead</span>
            </div>
          </label>
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
            id="btn_confirm_bulk_add_note"
            type="button"
            onClick={handleConfirm}
            disabled={!content.trim() || isProcessing}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Adicionando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Salvar Nota ({selectedContacts.length} Leads)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
