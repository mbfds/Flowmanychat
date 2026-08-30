import React, { useState } from 'react';
import { X, Send, Radio, ShieldCheck, CheckCircle2, Clock, AtSign, Image as ImageIcon, Mic } from 'lucide-react';
import { GroupBroadcastTask, WhatsAppGroup } from '../../types';

interface GroupBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: WhatsAppGroup[];
  onSendBroadcast: (task: GroupBroadcastTask) => void;
}

export const GroupBroadcastModal: React.FC<GroupBroadcastModalProps> = ({
  isOpen,
  onClose,
  groups,
  onSendBroadcast
}) => {
  const [title, setTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [selectedJids, setSelectedJids] = useState<string[]>(groups.map(g => g.jid));
  const [mentionAll, setMentionAll] = useState(false);
  const [mediaType, setMediaType] = useState<GroupBroadcastTask['mediaType']>('text');
  const [mediaUrl, setMediaUrl] = useState('');
  const [delayMin, setDelayMin] = useState(5);
  const [delayMax, setDelayMax] = useState(12);

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

  const selectAll = () => {
    if (selectedJids.length === groups.length) {
      setSelectedJids([groups[0].jid]);
    } else {
      setSelectedJids(groups.map(g => g.jid));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || selectedJids.length === 0) return;

    const task: GroupBroadcastTask = {
      id: `task_${Date.now()}`,
      title: title.trim() || `Disparo em ${selectedJids.length} Grupos`,
      targetGroupJids: selectedJids,
      messageText: messageText.trim(),
      mediaType,
      mediaUrl: mediaUrl.trim() || undefined,
      mentionAll,
      delayMinSeconds: delayMin,
      delayMaxSeconds: delayMax,
      status: 'sending',
      sentCount: 0,
      totalCount: selectedJids.length,
      createdAt: new Date().toISOString()
    };

    onSendBroadcast(task);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Disparador em Massa para Grupos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Envio simultâneo com delay anti-ban inteligente via Baileys Engine
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
              Título da Campanha (Interno)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Aviso Live de Hoje 20h"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Texto da Mensagem *
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMessageText(prev => prev + ' *texto em negrito*')}
                  className="px-1.5 py-0.5 text-[11px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  *Negrito*
                </button>
                <button
                  type="button"
                  onClick={() => setMessageText(prev => prev + ' _texto em itálico_')}
                  className="px-1.5 py-0.5 text-[11px] italic rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  _Itálico_
                </button>
              </div>
            </div>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="🚨 Fala pessoal! A aula ao vivo vai começar em 15 minutos..."
              rows={4}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none font-sans"
              required
            />
          </div>

          {/* Options: Mention All & Media */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <AtSign className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Marcar Todos (@todos)
                </span>
                <span className="text-[11px] text-slate-500">Notifica todos os membros do grupo</span>
              </div>
              <input
                type="checkbox"
                checked={mentionAll}
                onChange={(e) => setMentionAll(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Anti-Ban Delay Aleatório
                </span>
                <span className="text-[11px] text-slate-500">{delayMin}s a {delayMax}s entre grupos</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={delayMin}
                  onChange={(e) => setDelayMin(Number(e.target.value))}
                  className="w-12 px-1.5 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-center"
                />
                <span className="text-xs text-slate-400">-</span>
                <input
                  type="number"
                  value={delayMax}
                  onChange={(e) => setDelayMax(Number(e.target.value))}
                  className="w-12 px-1.5 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-center"
                />
              </div>
            </div>
          </div>

          {/* Group Target Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Grupos de Destino ({selectedJids.length}/{groups.length})
              </label>
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                {selectedJids.length === groups.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {groups.map((grp) => {
                const isSelected = selectedJids.includes(grp.jid);
                return (
                  <div
                    key={grp.id}
                    onClick={() => toggleGroup(grp.jid)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={grp.avatarUrl} alt={grp.name} className="w-7 h-7 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">{grp.name}</span>
                        <span className="text-[10px] text-slate-500">{grp.memberCount} membros</span>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
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
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Iniciar Disparo em {selectedJids.length} Grupos</span>
          </button>
        </div>
      </div>
    </div>
  );
};
