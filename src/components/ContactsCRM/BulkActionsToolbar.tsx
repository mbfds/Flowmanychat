import React, { useState } from 'react';
import { 
  GitFork, 
  Tag as TagIcon, 
  Download, 
  StickyNote, 
  Sliders, 
  Trash2, 
  X, 
  CheckSquare, 
  Square, 
  Sparkles, 
  FileSpreadsheet, 
  Code2, 
  Flame, 
  Zap, 
  Check, 
  ChevronDown 
} from 'lucide-react';
import { Contact, Flow } from '../../types';

interface BulkActionsToolbarProps {
  selectedContactsCount: number;
  totalFilteredCount: number;
  totalContactsCount: number;
  onClearSelection: () => void;
  onSelectAllFiltered: () => void;
  isAllFilteredSelected: boolean;
  onOpenAssignFlow: () => void;
  onOpenManageTags: () => void;
  onOpenAddNote: () => void;
  onOpenStatusScore: () => void;
  onExportSelectedCSV: () => void;
  onExportSelectedJSON: () => void;
  onDeleteSelected: () => void;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedContactsCount,
  totalFilteredCount,
  totalContactsCount,
  onClearSelection,
  onSelectAllFiltered,
  isAllFilteredSelected,
  onOpenAssignFlow,
  onOpenManageTags,
  onOpenAddNote,
  onOpenStatusScore,
  onExportSelectedCSV,
  onExportSelectedJSON,
  onDeleteSelected
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (selectedContactsCount === 0) return null;

  return (
    <div 
      id="contacts_bulk_actions_toolbar"
      className="sticky top-0 z-30 mb-4 p-3 bg-gradient-to-r from-[#1A1D21] via-[#24292F] to-[#1A1D21] text-white rounded-2xl shadow-xl border border-gray-700/60 backdrop-blur-md animate-in slide-in-from-top duration-200"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Left Side: Counter & Selection Helpers */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#0084FF] text-white font-black text-xs shadow-xs">
              {selectedContactsCount}
            </span>
            <div className="text-xs">
              <span className="font-bold text-white">
                {selectedContactsCount === 1 ? 'Contato Selecionado' : 'Contatos Selecionados'}
              </span>
              <span className="text-[11px] text-gray-400 block sm:inline sm:ml-1">
                (de {totalFilteredCount} {totalFilteredCount === 1 ? 'filtrado' : 'filtrados'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!isAllFilteredSelected ? (
              <button
                id="btn_select_all_filtered_contacts"
                type="button"
                onClick={onSelectAllFiltered}
                className="py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckSquare className="w-3 h-3 text-[#0084FF]" />
                <span>Selecionar todos ({totalFilteredCount})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClearSelection}
                className="py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Square className="w-3 h-3" />
                <span>Desmarcar tudo</span>
              </button>
            )}

            <button
              onClick={onClearSelection}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Limpar seleção"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: Bulk Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto justify-end">
          {/* Action: Assign to Flow */}
          <button
            id="btn_bulk_assign_flow"
            type="button"
            onClick={onOpenAssignFlow}
            className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102"
            title="Vincular ou disparar fluxo de automação para os contatos selecionados"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Atribuir a Fluxo</span>
          </button>

          {/* Action: Manage Tags */}
          <button
            id="btn_bulk_manage_tags"
            type="button"
            onClick={onOpenManageTags}
            className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102"
            title="Adicionar ou remover tags em massa"
          >
            <TagIcon className="w-3.5 h-3.5" />
            <span>Tags</span>
          </button>

          {/* Action: Add Internal Note */}
          <button
            id="btn_bulk_add_note"
            type="button"
            onClick={onOpenAddNote}
            className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102"
            title="Inserir anotação interna corporativa na seleção"
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>Nota Interna</span>
          </button>

          {/* Action: Status & Lead Score */}
          <button
            id="btn_bulk_status_score"
            type="button"
            onClick={onOpenStatusScore}
            className="py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102"
            title="Alterar status do bot ou conceder bônus de lead scoring"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Status & Score</span>
          </button>

          {/* Action: Export Dropdown */}
          <div className="relative">
            <button
              id="btn_bulk_export_dropdown"
              type="button"
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Exportar os contatos selecionados"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Exportar</span>
              <ChevronDown className="w-3 h-3 text-gray-300" />
            </button>

            {showExportMenu && (
              <div 
                className="absolute right-0 mt-1.5 w-48 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setShowExportMenu(false)}
              >
                <button
                  id="btn_export_selected_csv"
                  type="button"
                  onClick={() => {
                    setShowExportMenu(false);
                    onExportSelectedCSV();
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-gray-700 hover:text-emerald-700"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Planilha CSV (Excel)</span>
                </button>

                <button
                  id="btn_export_selected_json"
                  type="button"
                  onClick={() => {
                    setShowExportMenu(false);
                    onExportSelectedJSON();
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-gray-700 hover:text-blue-600 border-t border-gray-100"
                >
                  <Code2 className="w-4 h-4 text-blue-600" />
                  <span>Estrutura JSON (API)</span>
                </button>
              </div>
            )}
          </div>

          {/* Action: Delete Selected */}
          <div className="relative">
            {!showDeleteConfirm ? (
              <button
                id="btn_bulk_delete_prompt"
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="py-1.5 px-2.5 rounded-xl bg-rose-600/30 hover:bg-rose-600 border border-rose-500/40 text-rose-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Excluir contatos selecionados"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-rose-950/90 p-1 rounded-xl border border-rose-500 animate-in fade-in">
                <span className="text-[10px] text-rose-200 px-1 font-bold">Excluir {selectedContactsCount}?</span>
                <button
                  id="btn_bulk_confirm_delete"
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    onDeleteSelected();
                  }}
                  className="py-0.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer"
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="py-0.5 px-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-[10px] cursor-pointer"
                >
                  Não
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
