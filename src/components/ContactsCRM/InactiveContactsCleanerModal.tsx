import React, { useState, useMemo } from 'react';
import { 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  X, 
  Check, 
  Clock, 
  UserX, 
  Search, 
  Layers, 
  Database,
  ArrowRight,
  Info,
  Calendar,
  Zap,
  Filter
} from 'lucide-react';
import { Contact } from '../../types';
import { getContactDaysInactive, formatInactivityBadge } from '../../utils/inactivityHelper';

interface InactiveContactsCleanerModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onConfirmPurge: (idsToDelete: string[], daysThreshold: number) => void;
  initialDays?: number;
}

export const InactiveContactsCleanerModal: React.FC<InactiveContactsCleanerModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onConfirmPurge,
  initialDays = 90
}) => {
  const [daysThreshold, setDaysThreshold] = useState<number>(initialDays);
  const [customDays, setCustomDays] = useState<string>('90');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Safety Protections
  const [protectVip, setProtectVip] = useState(true);
  const [protectHighScore, setProtectHighScore] = useState(true);
  const [protectHumanAssigned, setProtectHumanAssigned] = useState(true);
  const [autoExportBackup, setAutoExportBackup] = useState(true);

  // Excluded IDs from deletion (user unchecked in table)
  const [manuallyExcludedIds, setManuallyExcludedIds] = useState<Set<string>>(new Set());

  // Search in preview table
  const [previewSearch, setPreviewSearch] = useState('');

  // Confirmation phrase
  const [confirmationInput, setConfirmationInput] = useState('');

  if (!isOpen) return null;

  const currentThreshold = isCustomMode ? (parseInt(customDays, 10) || 90) : daysThreshold;

  // Classify all contacts based on inactivity and protections
  const { eligibleContacts, protectedContacts, inactiveCount } = useMemo(() => {
    let inactive = 0;
    const eligible: Contact[] = [];
    const protectedList: Contact[] = [];

    contacts.forEach((c) => {
      const days = getContactDaysInactive(c);
      if (days >= currentThreshold) {
        inactive++;

        // Check protections
        const isVip = protectVip && c.tags.some((t) => 
          /vip|cliente|comprador|assinante|aluno|lead-quente/i.test(t)
        );
        const isHighScore = protectHighScore && (c.leadScore || 0) >= 70;
        const isHumanAssigned = protectHumanAssigned && c.status === 'human_assigned';

        if (isVip || isHighScore || isHumanAssigned) {
          protectedList.push(c);
        } else {
          eligible.push(c);
        }
      }
    });

    return { eligibleContacts: eligible, protectedContacts: protectedList, inactiveCount: inactive };
  }, [contacts, currentThreshold, protectVip, protectHighScore, protectHumanAssigned]);

  // Final IDs to delete (eligible minus manually excluded)
  const finalIdsToDelete = useMemo(() => {
    return eligibleContacts
      .filter((c) => !manuallyExcludedIds.has(c.id))
      .map((c) => c.id);
  }, [eligibleContacts, manuallyExcludedIds]);

  // Filtered list for table preview
  const filteredPreview = useMemo(() => {
    return eligibleContacts.filter((c) => {
      const query = previewSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(query) ||
        c.username.toLowerCase().includes(query) ||
        (c.email && c.email.toLowerCase().includes(query)) ||
        c.tags.some((t) => t.toLowerCase().includes(query))
      );
    });
  }, [eligibleContacts, previewSearch]);

  const handleToggleExclude = (id: string) => {
    setManuallyExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllInPreview = () => {
    setManuallyExcludedIds(new Set());
  };

  const handleDeselectAllInPreview = () => {
    setManuallyExcludedIds(new Set(eligibleContacts.map((c) => c.id)));
  };

  const handleExecutePurge = () => {
    if (finalIdsToDelete.length === 0) return;

    // Trigger CSV export if requested
    if (autoExportBackup) {
      const contactsToBackup = eligibleContacts.filter((c) => !manuallyExcludedIds.has(c.id));
      const headers = ['ID', 'Nome', 'Username', 'Canal', 'Email', 'Telefone', 'Dias Inativo', 'Ultima Interacao', 'Lead Score', 'Tags'];
      const rows = contactsToBackup.map((c) => [
        `"${c.id}"`,
        `"${c.name}"`,
        `"${c.username}"`,
        `"${c.channel}"`,
        `"${c.email || ''}"`,
        `"${c.phone || ''}"`,
        `"${getContactDaysInactive(c)}"`,
        `"${c.lastInteractionAt}"`,
        `"${c.leadScore || 0}"`,
        `"${c.tags.join(', ')}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `backup_contatos_inativos_${currentThreshold}d_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    onConfirmPurge(finalIdsToDelete, currentThreshold);
    onClose();
  };

  const isConfirmed = confirmationInput.trim().toUpperCase() === 'CONFIRMAR';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50/50 via-slate-50 to-blue-50/30">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Otimizador da Base de Dados & Limpeza de Inativos
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                  CRM Cleanup
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Identifique e remova contatos que não interagem há um período determinado para reduzir custos de API e elevar métricas de entrega.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* 1. Inactivity Threshold Selector */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-3">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Período de Inatividade Considerado:</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { days: 30, label: '30 dias', hint: '1 mês' },
                { days: 60, label: '60 dias', hint: '2 meses' },
                { days: 90, label: '90 dias', hint: 'Recomendado' },
                { days: 180, label: '180 dias', hint: '6 meses' },
                { days: 365, label: '365 dias', hint: '1 ano' },
              ].map((p) => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => {
                    setIsCustomMode(false);
                    setDaysThreshold(p.days);
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    !isCustomMode && daysThreshold === p.days
                      ? 'bg-rose-50 border-rose-400 text-rose-900 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80 font-medium'
                  }`}
                >
                  <div className="text-xs font-bold">{p.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{p.hint}</div>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  isCustomMode
                    ? 'bg-rose-50 border-rose-400 text-rose-900 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80 font-medium'
                }`}
              >
                <div className="text-xs font-bold">Personalizado</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Definir dias</div>
              </button>
            </div>

            {isCustomMode && (
              <div className="flex items-center gap-2 pt-2 animate-in fade-in">
                <span className="text-xs text-slate-600">Considerar contatos inativos há mais de:</span>
                <input
                  type="number"
                  min="1"
                  max="1500"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="w-24 px-2.5 py-1 text-xs font-bold bg-white border border-rose-300 rounded-lg text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
                <span className="text-xs font-bold text-slate-700">dias corridos</span>
              </div>
            )}
          </div>

          {/* 2. Optimization Impact Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 block">Total na Base</span>
              <div className="text-xl font-black text-slate-900 mt-1">{contacts.length}</div>
              <span className="text-[10px] text-slate-400">contatos registrados</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-2xs">
              <span className="text-[11px] font-bold text-amber-800 block">Inativos (&gt; {currentThreshold}d)</span>
              <div className="text-xl font-black text-amber-900 mt-1">{inactiveCount}</div>
              <span className="text-[10px] text-amber-700">sem interação recente</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 shadow-2xs">
              <span className="text-[11px] font-bold text-blue-800 block">Protegidos por Regras</span>
              <div className="text-xl font-black text-blue-900 mt-1">{protectedContacts.length}</div>
              <span className="text-[10px] text-blue-700">VIPs, Quentes ou Suporte</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-300 shadow-2xs">
              <span className="text-[11px] font-bold text-rose-800 block">Elegíveis para Purga</span>
              <div className="text-xl font-black text-rose-700 mt-1">{finalIdsToDelete.length}</div>
              <span className="text-[10px] text-rose-600 font-medium">prontos para exclusão</span>
            </div>
          </div>

          {/* 3. Safety Guardrails Checklist */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800">
                Regras de Proteção e Salvaguarda
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={protectVip}
                  onChange={(e) => setProtectVip(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Proteger Contatos VIP / Clientes</span>
                  <span className="text-[10px] text-slate-500">Não remove contatos com tags VIP, Cliente, Comprador ou Assinante.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={protectHighScore}
                  onChange={(e) => setProtectHighScore(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Proteger Leads Quentes (Score ≥ 70)</span>
                  <span className="text-[10px] text-slate-500">Mantém contatos com alta pontuação de engajamento acumulada.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={protectHumanAssigned}
                  onChange={(e) => setProtectHumanAssigned(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Proteger Atendimento Humano Aberto</span>
                  <span className="text-[10px] text-slate-500">Preserva conversas transferidas para atendentes humanos.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={autoExportBackup}
                  onChange={(e) => setAutoExportBackup(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold text-emerald-900 block flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                    Exportar Backup CSV Antes de Deletar
                  </span>
                  <span className="text-[10px] text-emerald-700">Gera download automático da lista de contatos antes da exclusão.</span>
                </div>
              </label>
            </div>
          </div>

          {/* 4. Candidate Contacts Preview Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-3 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-800">
                  Contatos Inativos Selecionados para Exclusão ({finalIdsToDelete.length})
                </h3>
                <span className="text-[10px] text-slate-500">
                  Desmarque qualquer contato que deseje preservar na base.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-44">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={previewSearch}
                    onChange={(e) => setPreviewSearch(e.target.value)}
                    placeholder="Filtrar prévia..."
                    className="w-full pl-7 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSelectAllInPreview}
                  className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Marcar Todos
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAllInPreview}
                  className="text-[10px] font-bold text-slate-500 hover:underline cursor-pointer"
                >
                  Desmarcar Todos
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="p-2.5 w-8">Purga</th>
                    <th className="p-2.5">Contato</th>
                    <th className="p-2.5">Canal</th>
                    <th className="p-2.5">Inatividade</th>
                    <th className="p-2.5">Lead Score</th>
                    <th className="p-2.5">Tags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPreview.map((c) => {
                    const days = getContactDaysInactive(c);
                    const badge = formatInactivityBadge(days);
                    const isMarked = !manuallyExcludedIds.has(c.id);

                    return (
                      <tr 
                        key={c.id} 
                        className={`hover:bg-slate-50/80 transition-colors ${
                          !isMarked ? 'opacity-40 bg-slate-50/40' : ''
                        }`}
                      >
                        <td className="p-2.5">
                          <input
                            type="checkbox"
                            checked={isMarked}
                            onChange={() => handleToggleExclude(c.id)}
                            className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-2">
                            <img
                              src={c.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block truncate max-w-[140px]">
                                {c.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                                @{c.username}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 capitalize">
                            {c.channel}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            {badge.label}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] font-bold text-slate-700">
                          {c.leadScore || 0} pts
                        </td>
                        <td className="p-2.5">
                          <div className="flex flex-wrap gap-1 max-w-[160px]">
                            {c.tags.slice(0, 2).map((t) => (
                              <span key={t} className="px-1.5 py-0.2 rounded text-[9px] bg-slate-100 text-slate-600 font-medium">
                                {t}
                              </span>
                            ))}
                            {c.tags.length > 2 && (
                              <span className="text-[9px] text-slate-400 font-bold">+{c.tags.length - 2}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredPreview.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Nenhum contato inativo elegível encontrado com este filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Final Confirmation Step */}
          {finalIdsToDelete.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/90 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="text-xs font-bold text-rose-900">
                  Confirmação de Segurança Requerida
                </span>
              </div>
              <p className="text-xs text-rose-800">
                Esta ação excluirá definitivamente <strong>{finalIdsToDelete.length} contatos inativos</strong> da sua base de dados do ManyFlow. Para confirmar, digite <span className="font-mono font-bold bg-white/80 px-1 py-0.5 rounded border border-rose-300">CONFIRMAR</span> abaixo:
              </p>
              <div className="flex items-center gap-2 pt-1 max-w-sm">
                <input
                  type="text"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  placeholder="Digite CONFIRMAR"
                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-xs font-mono font-bold text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
                {isConfirmed && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Validado
                  </span>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400" />
            <span>{finalIdsToDelete.length} contatos serão purgados da base</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              id="btn_confirm_inactive_purge"
              type="button"
              disabled={finalIdsToDelete.length === 0 || !isConfirmed}
              onClick={handleExecutePurge}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
                finalIdsToDelete.length > 0 && isConfirmed
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Otimizar e Purgar {finalIdsToDelete.length} Contatos</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
