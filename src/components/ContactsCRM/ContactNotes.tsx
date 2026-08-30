import React, { useState } from 'react';
import { 
  StickyNote, 
  Plus, 
  Pin, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  User, 
  Clock, 
  AlertCircle, 
  Sparkles,
  Tag as TagIcon,
  MessageSquare
} from 'lucide-react';
import { Contact, ContactNote } from '../../types';

interface ContactNotesProps {
  contact: Contact;
  onUpdateContact: (updatedContact: Contact) => void;
}

const CATEGORY_MAP: Record<string, { label: string; bg: string; text: string; border: string; icon: string }> = {
  general: { label: 'Geral', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: '📝' },
  sales: { label: 'Vendas & Proposta', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: '💼' },
  support: { label: 'Suporte Técnico', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', icon: '🎧' },
  important: { label: 'Alta Prioridade', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', icon: '🚨' },
  followup: { label: 'Follow-up Agendado', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: '⏰' }
};

const TEAM_MEMBERS = [
  { name: 'Lucas Santos', role: 'Executivo de Vendas' },
  { name: 'Ana Beatriz', role: 'Sucesso do Cliente' },
  { name: 'Carlos Menezes', role: 'Especialista Comercial' },
  { name: 'Juliana Rocha', role: 'Suporte & Atendimento' },
  { name: 'Admin Equipe', role: 'Gestor' }
];

const QUICK_SNIPPETS = [
  'Lead pediu proposta personalizada',
  'Aguardando retorno por WhatsApp',
  'Lead com alto potencial (Ticket Alto)',
  'Dúvida sobre integração e Webhook',
  'Reunião de alinhamento agendada'
];

export const ContactNotes: React.FC<ContactNotesProps> = ({
  contact,
  onUpdateContact
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  // New note form state
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState(TEAM_MEMBERS[0].name);
  const [newCategory, setNewCategory] = useState<'general' | 'sales' | 'support' | 'important' | 'followup'>('general');
  const [isPinned, setIsPinned] = useState(false);

  // Edit note form state
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<'general' | 'sales' | 'support' | 'important' | 'followup'>('general');

  const notes = contact.internalNotes || [];

  // Sort notes: pinned first, then newest
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const selectedMember = TEAM_MEMBERS.find((m) => m.name === newAuthor) || TEAM_MEMBERS[0];

    const newNote: ContactNote = {
      id: `note_${Date.now()}`,
      author: selectedMember.name,
      authorRole: selectedMember.role,
      content: newContent.trim(),
      category: newCategory,
      createdAt: `Hoje às ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      isPinned
    };

    const updatedNotes = [newNote, ...notes];
    onUpdateContact({
      ...contact,
      internalNotes: updatedNotes
    });

    // Reset form
    setNewContent('');
    setIsAdding(false);
    setIsPinned(false);
    setNewCategory('general');
  };

  const handleTogglePin = (noteId: string) => {
    const updatedNotes = notes.map((n) => 
      n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
    );
    onUpdateContact({
      ...contact,
      internalNotes: updatedNotes
    });
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter((n) => n.id !== noteId);
    onUpdateContact({
      ...contact,
      internalNotes: updatedNotes
    });
  };

  const handleStartEdit = (note: ContactNote) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setEditCategory(note.category || 'general');
  };

  const handleSaveEdit = (noteId: string) => {
    if (!editContent.trim()) return;
    const updatedNotes = notes.map((n) => 
      n.id === noteId ? { ...n, content: editContent.trim(), category: editCategory } : n
    );
    onUpdateContact({
      ...contact,
      internalNotes: updatedNotes
    });
    setEditingNoteId(null);
  };

  const handleApplySnippet = (snippet: string) => {
    setNewContent((prev) => (prev ? `${prev} - ${snippet}` : snippet));
    if (!isAdding) setIsAdding(true);
  };

  return (
    <div className="space-y-4" id="contact_internal_notes_component">
      {/* Header with Title & Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <StickyNote className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1A1D21] flex items-center gap-1.5">
              <span>Notas Internas da Equipe</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                {notes.length}
              </span>
            </h4>
            <p className="text-[10px] text-[#64748B]">
              Observações privadas compartilhadas com atendentes e vendas
            </p>
          </div>
        </div>

        {!isAdding && (
          <button
            id="btn_add_internal_note"
            onClick={() => setIsAdding(true)}
            className="py-1.5 px-2.5 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Nota</span>
          </button>
        )}
      </div>

      {/* Quick Snippets Chips */}
      {!isAdding && notes.length === 0 && (
        <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-2">
          <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            Atalhos Rápidos de Observação:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SNIPPETS.map((snippet, idx) => (
              <button
                key={idx}
                onClick={() => handleApplySnippet(snippet)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-white border border-amber-200 text-amber-900 hover:bg-amber-100/50 transition-all font-medium text-left cursor-pointer"
              >
                + {snippet}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Note Form */}
      {isAdding && (
        <form 
          id="form_new_internal_note"
          onSubmit={handleAddNote} 
          className="p-4 rounded-xl bg-white border-2 border-[#0084FF]/40 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1A1D21] flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-[#0084FF]" />
              Nova Nota Interna
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[#64748B] hover:text-[#1A1D21] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <textarea
            id="textarea_internal_note_content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Escreva a observação sobre este lead... Ex: Cliente solicitou desconto de 20%, prefere contato após as 14h."
            rows={3}
            autoFocus
            className="w-full p-2.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF] focus:border-[#0084FF] resize-none"
          />

          {/* Quick Snippets inside form */}
          <div>
            <span className="text-[10px] text-[#64748B] block mb-1">Inserir atalho rápido:</span>
            <div className="flex flex-wrap gap-1">
              {QUICK_SNIPPETS.slice(0, 3).map((snippet, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleApplySnippet(snippet)}
                  className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                >
                  + {snippet}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {/* Author */}
            <div>
              <label className="text-[10px] font-bold text-[#64748B] uppercase block mb-1">
                Atendente / Autor:
              </label>
              <select
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="text-[10px] font-bold text-[#64748B] uppercase block mb-1">
                Categoria da Nota:
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none"
              >
                {Object.entries(CATEGORY_MAP).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.icon} {info.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pin Checkbox and Submit */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <label className="flex items-center gap-1.5 text-xs text-[#1A1D21] cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-[#E2E8F0] text-[#0084FF] focus:ring-0"
              />
              <Pin className="w-3.5 h-3.5 text-amber-500" />
              <span>Fixar no topo</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="py-1.5 px-3 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-gray-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="btn_save_internal_note"
                type="submit"
                disabled={!newContent.trim()}
                className="py-1.5 px-4 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar Nota</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Notes List */}
      <div className="space-y-2.5">
        {sortedNotes.length === 0 ? (
          <div className="p-5 rounded-xl bg-white border border-dashed border-[#E2E8F0] text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-[#64748B] flex items-center justify-center mx-auto">
              <StickyNote className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-[#1A1D21]">Nenhuma nota interna registrada</p>
            <p className="text-[11px] text-[#64748B] max-w-xs mx-auto">
              Adicione anotações de alinhamento com a equipe, status de vendas, preferências ou histórico do lead.
            </p>
          </div>
        ) : (
          sortedNotes.map((note) => {
            const cat = CATEGORY_MAP[note.category || 'general'] || CATEGORY_MAP.general;
            const isEditingThis = editingNoteId === note.id;

            return (
              <div
                key={note.id}
                className={`p-3.5 rounded-xl bg-white border transition-all ${
                  note.isPinned 
                    ? 'border-amber-300 bg-amber-50/20 shadow-xs' 
                    : 'border-[#E2E8F0] hover:border-gray-300'
                }`}
              >
                {/* Note Top Bar */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#0084FF]/10 text-[#0084FF] flex items-center justify-center text-[10px] font-bold">
                      {note.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1A1D21] flex items-center gap-1.5">
                        <span>{note.author}</span>
                        {note.authorRole && (
                          <span className="text-[10px] text-[#64748B] font-normal">
                            • {note.authorRole}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#64748B] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{note.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Category Chip */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cat.bg} ${cat.text} ${cat.border} flex items-center gap-1`}>
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>

                    {/* Pin button */}
                    <button
                      onClick={() => handleTogglePin(note.id)}
                      title={note.isPinned ? "Desafixar nota" : "Fixar no topo"}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        note.isPinned 
                          ? 'text-amber-600 bg-amber-100 hover:bg-amber-200' 
                          : 'text-gray-400 hover:text-amber-600 hover:bg-gray-100'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit button */}
                    {!isEditingThis && (
                      <button
                        onClick={() => handleStartEdit(note)}
                        title="Editar nota"
                        className="p-1 rounded-md text-gray-400 hover:text-[#0084FF] hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      title="Excluir nota"
                      className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note Content / Edit Mode */}
                {isEditingThis ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                      className="w-full p-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                    />
                    <div className="flex items-center justify-between">
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as any)}
                        className="px-2 py-1 rounded bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
                      >
                        {Object.entries(CATEGORY_MAP).map(([k, info]) => (
                          <option key={k} value={k}>
                            {info.icon} {info.label}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-2 py-1 rounded text-xs text-[#64748B] hover:bg-gray-100 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveEdit(note.id)}
                          className="px-3 py-1 rounded bg-[#0084FF] text-white text-xs font-bold hover:bg-[#0073E6] cursor-pointer"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#1A1D21] leading-relaxed whitespace-pre-wrap pl-8">
                    {note.content}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
