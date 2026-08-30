import React, { useState } from 'react';
import { X, Link2, Plus, Zap, CheckCircle2, Layers, ArrowRight } from 'lucide-react';
import { SmartLinkRotator, WhatsAppGroup } from '../../types';

interface CreateSmartLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: WhatsAppGroup[];
  onCreateSmartLink: (rotator: SmartLinkRotator) => void;
}

export const CreateSmartLinkModal: React.FC<CreateSmartLinkModalProps> = ({
  isOpen,
  onClose,
  groups,
  onCreateSmartLink
}) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [selectedJids, setSelectedJids] = useState<string[]>(groups.map(g => g.jid).slice(0, 2));
  const [maxMembers, setMaxMembers] = useState(980);
  const [redirectMode, setRedirectMode] = useState<SmartLinkRotator['redirectMode']>('least_filled');

  if (!isOpen) return null;

  const toggleGroup = (jid: string) => {
    if (selectedJids.includes(jid)) {
      if (selectedJids.length > 1) {
        setSelectedJids(selectedJids.filter(j => j !== jid));
      }
    } else {
      setSelectedJids([...selectedJids, jid]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    const newRotator: SmartLinkRotator = {
      id: `rotator_${Date.now()}`,
      title: title.trim(),
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      description: description.trim() || 'Link inteligente para distribuição e transbordo automático de grupos.',
      targetGroupJids: selectedJids,
      maxMembersPerGroup: Number(maxMembers) || 980,
      totalClicks: 0,
      totalConversions: 0,
      conversionRate: 0,
      isActive: true,
      redirectMode,
      createdAt: new Date().toISOString()
    };

    onCreateSmartLink(newRotator);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Criar Link Inteligente (Rotacionador)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nunca mais perca leads de anúncios quando um grupo atingir 1024 membros
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nome da Campanha / Link *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slug) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                }
              }}
              placeholder="Ex: Tráfego Pago - Lançamento Março"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Slug Personalizado da URL *
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-lg font-mono">
                chat.manyflow.io/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="vip-marzo"
                className="w-full px-3 py-2 text-sm rounded-r-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Limite Seguro por Grupo
              </label>
              <input
                type="number"
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="980"
              />
              <p className="text-[11px] text-slate-500 mt-1">Transborda para o próximo antes de bater 1024</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Estratégia de Redirecionamento
              </label>
              <select
                value={redirectMode}
                onChange={(e) => setRedirectMode(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="least_filled">⚡ Grupo com Menos Membros</option>
                <option value="sequential">➡️ Sequencial (Enche Grupo 1, depois Grupo 2)</option>
                <option value="balanced">⚖️ Balanceado (Distribuição 50/50)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Selecione os Grupos que farão parte do Rodízio ({selectedJids.length} selecionados)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {groups.map((grp) => {
                const isSelected = selectedJids.includes(grp.jid);
                return (
                  <div
                    key={grp.id}
                    onClick={() => toggleGroup(grp.jid)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={grp.avatarUrl} alt={grp.name} className="w-7 h-7 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">{grp.name}</span>
                        <span className="text-[10px] text-slate-500">{grp.memberCount} / {grp.maxMembers} membros</span>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Gerar Link Inteligente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
