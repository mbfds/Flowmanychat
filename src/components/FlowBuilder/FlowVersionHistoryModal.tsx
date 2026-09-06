import React, { useState, useEffect } from 'react';
import { 
  X, 
  History, 
  RotateCcw, 
  Save, 
  Database, 
  Sparkles, 
  Clock, 
  Trash2, 
  Check, 
  AlertCircle, 
  ChevronRight, 
  Layers, 
  GitCommit, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Flow, FlowVersion } from '../../types';
import { fetchFlowVersions, saveFlowSnapshot, restoreFlowVersion, deleteFlowVersion } from '../../services/flowVersionService';

interface FlowVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  flow: Flow;
  onRestoreFlow: (restoredFlow: Flow) => void;
}

export const FlowVersionHistoryModal: React.FC<FlowVersionHistoryModalProps> = ({
  isOpen,
  onClose,
  flow,
  onRestoreFlow
}) => {
  const [versions, setVersions] = useState<FlowVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoringId, setIsRestoringId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDesc, setNewVersionDesc] = useState('');
  const [selectedVersionForPreview, setSelectedVersionForPreview] = useState<FlowVersion | null>(null);
  const [confirmRestoreVersion, setConfirmRestoreVersion] = useState<FlowVersion | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mongoStatus, setMongoStatus] = useState<'connected' | 'local' | 'checking'>('checking');

  // Load versions whenever opened
  useEffect(() => {
    if (!isOpen) return;

    loadVersions();
    checkDatabaseStatus();
  }, [isOpen, flow.id]);

  const checkDatabaseStatus = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setMongoStatus('connected');
      } else {
        setMongoStatus('local');
      }
    } catch {
      setMongoStatus('local');
    }
  };

  const loadVersions = async () => {
    setIsLoading(true);
    try {
      const list = await fetchFlowVersions(flow.id);
      setVersions(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionName.trim()) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await saveFlowSnapshot(flow.id, {
        name: newVersionName.trim(),
        description: newVersionDesc.trim() || undefined,
        nodes: flow.nodes,
        connections: flow.connections,
        isAutoSave: false,
        createdBy: 'Operador ManyFlow'
      });

      if (res.success && res.version) {
        setVersions((prev) => [res.version!, ...prev]);
        setNewVersionName('');
        setNewVersionDesc('');
        setShowCreateForm(false);
        setSuccessMessage(`Snapshot "${res.version.name}" salvo com sucesso no MongoDB!`);
        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        setErrorMessage(res.error || 'Falha ao salvar versão.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao persistir no MongoDB.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecuteRestore = async (version: FlowVersion) => {
    setIsRestoringId(version.id);
    setErrorMessage(null);

    try {
      const res = await restoreFlowVersion(flow.id, version.id);
      const targetVersion = res.version || version;

      const restored: Flow = {
        ...flow,
        nodes: targetVersion.nodes,
        connections: targetVersion.connections,
        updatedAt: new Date().toISOString()
      };

      onRestoreFlow(restored);
      setConfirmRestoreVersion(null);
      setSuccessMessage(`Fluxo restaurado com sucesso para a versão "${version.name}"!`);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao restaurar versão selecionada.');
    } finally {
      setIsRestoringId(null);
    }
  };

  const handleDelete = async (versionId: string) => {
    if (!confirm('Tem certeza que deseja excluir este snapshot do histórico?')) return;

    await deleteFlowVersion(flow.id, versionId);
    setVersions((prev) => prev.filter((v) => v.id !== versionId));
    if (selectedVersionForPreview?.id === versionId) {
      setSelectedVersionForPreview(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="modal_flow_version_history_backdrop"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
    >
      <div 
        id="modal_flow_version_history"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Histórico de Versões & Snapshots
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <Database className="w-3 h-3 text-indigo-600" />
                  MongoDB flow_versions
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Salve e restaure instantaneamente versões anteriores de nós e conexões do fluxo "{flow.title}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn_refresh_version_history"
              onClick={loadVersions}
              title="Recarregar do MongoDB"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            <button
              id="btn_close_version_history"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Toasts */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs font-semibold text-rose-800 dark:text-rose-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Bar: Create Snapshot Button & Stats */}
        <div className="px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Estado Atual do Fluxo:
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200">
                {flow.nodes.length} nós
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200">
                {flow.connections.length} conexões
              </span>
            </div>
          </div>

          <button
            id="btn_toggle_create_snapshot_form"
            onClick={() => {
              if (!showCreateForm) {
                const now = new Date();
                setNewVersionName(`Snapshot - ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`);
              }
              setShowCreateForm(!showCreateForm);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{showCreateForm ? 'Cancelar' : 'Criar Novo Snapshot Agora'}</span>
          </button>
        </div>

        {/* Snapshot Creation Form */}
        {showCreateForm && (
          <form 
            onSubmit={handleCreateSnapshot}
            className="m-6 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3 animate-in slide-in-from-top-2"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Criar Snapshot de Versão (Persistência MongoDB)
              </h4>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
                Armazena estado completo dos {flow.nodes.length} nós e conexões
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome da Versão *
                </label>
                <input
                  type="text"
                  required
                  id="input_version_name"
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  placeholder="Ex: V2.1 - Antes de adicionar agente IA"
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Anotações / Descrição (Opcional)
                </label>
                <input
                  type="text"
                  id="input_version_desc"
                  value={newVersionDesc}
                  onChange={(e) => setNewVersionDesc(e.target.value)}
                  placeholder="Ex: Gatilho refinado e condicionais validadas"
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              >
                Descartar
              </button>
              <button
                type="submit"
                disabled={isSaving || !newVersionName.trim()}
                id="btn_submit_save_version"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando no MongoDB...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Gravar no MongoDB</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Restore Confirmation Dialog */}
        {confirmRestoreVersion && (
          <div className="m-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 space-y-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">
                  Confirmar Restauração da Versão "{confirmRestoreVersion.name}"?
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-200 mt-1 leading-relaxed">
                  Os nós e conexões atuais do builder serão substituídos pelo estado salvo nesta versão ({confirmRestoreVersion.nodeCount} nós e {confirmRestoreVersion.connectionCount} conexões gravados em {new Date(confirmRestoreVersion.createdAt).toLocaleString('pt-BR')}).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200 dark:border-amber-800">
              <button
                type="button"
                onClick={() => setConfirmRestoreVersion(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn_confirm_restore_version"
                disabled={isRestoringId === confirmRestoreVersion.id}
                onClick={() => handleExecuteRestore(confirmRestoreVersion)}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {isRestoringId === confirmRestoreVersion.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Restaurando nós...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Sim, Restaurar Versão</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Content Body: Versions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Carregando histórico de snapshots do MongoDB...
              </p>
            </div>
          ) : versions.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <History className="w-6 h-6" />
              </div>
              <div className="max-w-md">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                  Nenhum snapshot salvo ainda
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Crie o primeiro snapshot do seu fluxo para salvar uma cópia pontual no MongoDB e poder restaurá-la a qualquer momento em caso de alterações indesejadas.
                </p>
              </div>
              <button
                onClick={() => {
                  const now = new Date();
                  setNewVersionName(`V1.0 - Snapshot Inicial (${now.toLocaleDateString('pt-BR')})`);
                  setShowCreateForm(true);
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Snapshot Atual no MongoDB</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((ver, idx) => {
                const isSelected = selectedVersionForPreview?.id === ver.id;
                const isCurrentIdentical = 
                  ver.nodeCount === flow.nodes.length && 
                  ver.connectionCount === flow.connections.length;

                return (
                  <div
                    key={ver.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0 mt-0.5">
                          <GitCommit className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {ver.name}
                            </h4>
                            {idx === 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                Mais Recente
                              </span>
                            )}
                            {ver.isAutoSave && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                Auto-Save
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {ver.source === 'mongodb' ? 'MongoDB Atlas' : 'Snapshot Local'}
                            </span>
                          </div>

                          {ver.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                              {ver.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(ver.createdAt).toLocaleString('pt-BR')}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                              <Layers className="w-3.5 h-3.5 text-indigo-500" />
                              {ver.nodeCount} nós ({ver.connectionCount} conexões)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedVersionForPreview(isSelected ? null : ver)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                        >
                          {isSelected ? 'Ocultar Nós' : 'Ver Detalhes'}
                        </button>

                        <button
                          type="button"
                          id={`btn_restore_version_${ver.id}`}
                          onClick={() => setConfirmRestoreVersion(ver)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restaurar</span>
                        </button>

                        <button
                          type="button"
                          title="Excluir este snapshot"
                          onClick={() => handleDelete(ver.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Preview Nodes Drawer */}
                    {isSelected && (
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 animate-in slide-in-from-top-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                          <span>Nós Armazenados neste Snapshot ({ver.nodes?.length || 0}):</span>
                          <span className="text-indigo-600">ID: {ver.id}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                          {ver.nodes?.map((n) => (
                            <div
                              key={n.id}
                              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px]"
                            >
                              <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                {n.title}
                              </div>
                              <div className="text-[10px] text-slate-500 capitalize">
                                Tipo: {n.type}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Coleção MongoDB: <strong>flow_versions</strong> com indexação automática por flowId.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
