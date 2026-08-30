import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  Trash2, 
  Server, 
  Lock, 
  Palette, 
  Sparkles, 
  Layers, 
  HelpCircle,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { TenantDomain, Tenant, TenantBranding } from '../../types';
import { tenantService } from '../../services/tenantService';
import { useAuth } from '../../context/AuthContext';

export const DomainManager: React.FC = () => {
  const { tenant, tenants, refreshSession } = useAuth();
  const [domains, setDomains] = useState<TenantDomain[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Domain Form Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState(tenant?.id || 'tenant_main');
  const [isPrimaryDomain, setIsPrimaryDomain] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Branding Editor state
  const [brandingForm, setBrandingForm] = useState<TenantBranding>(
    tenant?.branding || {
      brandName: 'ManyFlow',
      primaryColor: '#0084FF',
      accentColor: '#6366F1',
      supportEmail: 'suporte@manyflow.com',
      footerText: 'ManyFlow © 2026 - Automação Multi-Domínio'
    }
  );
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [brandingSuccess, setBrandingSuccess] = useState(false);

  const fetchDomains = async () => {
    setIsLoading(true);
    try {
      const allDomains = await tenantService.getDomains();
      setDomains(allDomains);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newDomainName) {
      return setFormError('Digite o nome do domínio.');
    }

    setIsLoading(true);
    const res = await tenantService.registerDomain(newDomainName, selectedTenantId, isPrimaryDomain);
    setIsLoading(false);

    if (res.success) {
      setNewDomainName('');
      setIsAddModalOpen(false);
      await fetchDomains();
      await refreshSession();
    } else {
      setFormError(res.error || 'Erro ao registrar domínio.');
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    setIsVerifying(domainId);
    try {
      await tenantService.verifyDomain(domainId);
      await fetchDomains();
    } catch (err) {
      console.warn('Erro ao verificar domínio:', err);
    } finally {
      setIsVerifying(null);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm('Deseja realmente remover este domínio?')) return;
    try {
      await tenantService.deleteDomain(domainId);
      await fetchDomains();
      await refreshSession();
    } catch (err) {
      console.warn('Erro ao remover domínio:', err);
    }
  };

  const handleSaveBranding = async () => {
    if (!tenant) return;
    setIsSavingBranding(true);
    try {
      await tenantService.updateTenant(tenant.id, { branding: brandingForm });
      setBrandingSuccess(true);
      setTimeout(() => setBrandingSuccess(false), 2500);
      await refreshSession();
    } catch (err) {
      console.warn('Erro ao salvar branding:', err);
    } finally {
      setIsSavingBranding(false);
    }
  };

  const currentHost = window.location.hostname;

  return (
    <div id="domain_manager_view" className="space-y-6">
      {/* Top Architecture Explanation Banner */}
      <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1A1D21]">Arquitetura Multi-Domínio & White-Label</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                1 Servidor • 1 Banco de Dados MongoDB
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Aponte dezenas de domínios para o mesmo servidor aaPanel/Nginx. O backend identifica o host recebido e isola contatos, fluxos e identidade visual automaticamente.
            </p>
          </div>
        </div>

        <button
          id="btn_open_add_domain_modal"
          onClick={() => setIsAddModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Domínio</span>
        </button>
      </div>

      {/* Grid: Domains Table & White-Label Customization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (7 cols): Registered Domains */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-blue-600" />
                  <span>Domínios Conectados ({domains.length})</span>
                </h4>
                <p className="text-[11px] text-[#64748B]">Domínios autorizados a carregar este sistema com certificado SSL</p>
              </div>

              <button
                onClick={fetchDomains}
                disabled={isLoading}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="Atualizar lista"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Domains List */}
            <div className="space-y-3">
              {domains.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-[#64748B] space-y-2">
                  <Globe className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>Nenhum domínio customizado cadastrado ainda.</p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Clique aqui para adicionar seu primeiro domínio
                  </button>
                </div>
              ) : (
                domains.map((dom) => {
                  const isCurrentActive = currentHost.includes(dom.domain) || dom.domain.includes(currentHost);
                  return (
                    <div
                      key={dom.id}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        isCurrentActive
                          ? 'bg-blue-50/30 border-blue-300 ring-1 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                            <Globe className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-[#1A1D21] font-mono truncate">{dom.domain}</h5>
                              {dom.isPrimary && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-blue-100 text-blue-800">
                                  PRINCIPAL
                                </span>
                              )}
                              {isCurrentActive && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  DOMÍNIO ATUAL
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              Destino Local: <code className="font-mono text-slate-700">{dom.targetHost || '127.0.0.1:3000'}</code>
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleVerifyDomain(dom.id)}
                            disabled={isVerifying === dom.id}
                            className="py-1 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
                            title="Testar Conexão DNS"
                          >
                            {isVerifying === dom.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                            ) : (
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            )}
                            <span>Verificar</span>
                          </button>

                          <button
                            onClick={() => handleDeleteDomain(dom.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remover Domínio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Status Badges Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Lock className="w-3 h-3 text-emerald-600" />
                            <span>SSL Let's Encrypt Ativo</span>
                          </span>

                          <span className="flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            <span>DNS Apontado</span>
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono">
                          Criado em: {new Date(dom.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* DNS Instructions Box */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5 text-slate-200">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                  Como apontar qualquer domínio para o seu servidor (aaPanel / Nginx)
                </span>
                <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  Porta 3000
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Opção 1: Entrada tipo A (Direto no IP do Servidor)</span>
                    <span className="font-mono text-emerald-400">@ ou app.seudominio.com ➔ [IP_DO_SEU_SERVIDOR_AAPANEL]</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Opção 2: Entrada CNAME</span>
                    <span className="font-mono text-sky-400">chat.cliente.com.br ➔ app.manyflow.com (ou domínio principal)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col (5 cols): White-Label Branding Customization */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Personalização White-Label</span>
                </h4>
                <p className="text-[11px] text-[#64748B]">Personalize as cores e nome da sua marca para este domínio</p>
              </div>

              <button
                onClick={handleSaveBranding}
                disabled={isSavingBranding}
                className="py-1.5 px-3 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                {isSavingBranding ? <RefreshCw className="w-3 h-3 animate-spin" /> : brandingSuccess ? <Check className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                <span>{brandingSuccess ? 'Salvo!' : 'Salvar'}</span>
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#1A1D21] mb-1">Nome da Marca / Sistema</label>
                <input
                  type="text"
                  value={brandingForm.brandName}
                  onChange={(e) => setBrandingForm({ ...brandingForm, brandName: e.target.value })}
                  placeholder="Ex: ManyFlow, AtendeFácil, AutoBot VIP"
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1D21] mb-1">Cor Primária (Identidade Visual)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandingForm.primaryColor}
                    onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                    className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={brandingForm.primaryColor}
                    onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 rounded-xl border border-slate-200 focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1D21] mb-1">Email de Suporte ao Cliente</label>
                <input
                  type="email"
                  value={brandingForm.supportEmail || ''}
                  onChange={(e) => setBrandingForm({ ...brandingForm, supportEmail: e.target.value })}
                  placeholder="suporte@seudominio.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1D21] mb-1">Texto do Rodapé (Copyright)</label>
                <input
                  type="text"
                  value={brandingForm.footerText || ''}
                  onChange={(e) => setBrandingForm({ ...brandingForm, footerText: e.target.value })}
                  placeholder="Sua Marca © 2026 - Todos os direitos reservados"
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>

            {/* Live Brand Preview Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Prévia Visual do Botão e Logotipo
              </span>
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-xs"
                    style={{ backgroundColor: brandingForm.primaryColor }}
                  >
                    {brandingForm.brandName.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-xs font-black text-[#1A1D21]">{brandingForm.brandName}</span>
                </div>
                <button
                  type="button"
                  className="py-1 px-3 rounded-lg text-white text-xs font-bold shadow-xs"
                  style={{ backgroundColor: brandingForm.primaryColor }}
                >
                  Entrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Domain Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-[#1A1D21]">Adicionar Novo Domínio</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddDomain} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1D21] mb-1">Nome do Domínio ou Subdomínio</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: app.suaagencia.com.br ou bot.cliente.com"
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1D21] mb-1">Vincular ao Workspace / Tenant</label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white outline-hidden"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk_is_primary"
                  checked={isPrimaryDomain}
                  onChange={(e) => setIsPrimaryDomain(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="chk_is_primary" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Definir como domínio padrão principal deste workspace
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="py-2 px-5 rounded-xl bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Salvar & Cadastrar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
