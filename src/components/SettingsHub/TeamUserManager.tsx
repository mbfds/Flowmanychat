import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Crown, 
  Briefcase, 
  Headphones, 
  Eye, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Trash2, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Building2, 
  CheckCircle2, 
  X,
  Search,
  MoreVertical,
  Activity,
  Key,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User, UserRole, SubscriptionPlan } from '../../types';
import { authService } from '../../services/authService';
import { plansAndAffiliatesService } from '../../services/plansAndAffiliatesService';

export const TeamUserManager: React.FC = () => {
  const { user: currentUser, tenant } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('agent');
  const [invitePassword, setInvitePassword] = useState('manyflow2026');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [viewTab, setViewTab] = useState<'members' | 'rbac_matrix'>('members');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const [userList, planList] = await Promise.all([
        authService.getUsers(tenant?.id || 'tenant_main'),
        plansAndAffiliatesService.getPlans()
      ]);
      if (userList && userList.length > 0) {
        setUsers(userList);
      } else if (currentUser) {
        setUsers([currentUser]);
      } else {
        setUsers([]);
      }
      setPlans(planList);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [tenant?.id]);

  const handleChangePlan = async (targetUser: User, newPlanSlug: string) => {
    const res = await authService.updateUser(targetUser.id, { plan: newPlanSlug } as any);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, plan: newPlanSlug } : u))
      );
      setFeedbackMsg({
        type: 'success',
        text: `Pacote do usuário ${targetUser.name} alterado para ${newPlanSlug.toUpperCase()}.`
      });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setIsSubmitting(true);

    const res = await authService.inviteUser({
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      tenantId: tenant?.id || 'tenant_main'
    });

    setIsSubmitting(false);
    if (res.success && res.user) {
      setUsers((prev) => [res.user!, ...prev]);
      setIsInviteModalOpen(false);
      setInviteName('');
      setInviteEmail('');
      setInviteRole('agent');
      setFeedbackMsg({ type: 'success', text: `Membro ${inviteName} adicionado à equipe com sucesso!` });
      setTimeout(() => setFeedbackMsg(null), 3500);
    } else {
      setModalError(res.error || 'Erro ao convidar usuário.');
    }
  };

  const handleToggleStatus = async (targetUser: User) => {
    const newStatus = !targetUser.isActive;
    const res = await authService.updateUser(targetUser.id, { isActive: newStatus });
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, isActive: newStatus } : u))
      );
      setFeedbackMsg({
        type: 'success',
        text: `Status do usuário ${targetUser.name} alterado para ${newStatus ? 'Ativo' : 'Inativo'}.`
      });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleChangeRole = async (targetUser: User, newRole: UserRole) => {
    const res = await authService.updateUser(targetUser.id, { role: newRole });
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
      setFeedbackMsg({
        type: 'success',
        text: `Papel de ${targetUser.name} atualizado para ${newRole.toUpperCase()}.`
      });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleDeleteUser = async (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      return alert('Você não pode excluir sua própria conta de usuário logado.');
    }
    if (!window.confirm(`Tem certeza que deseja remover o usuário ${targetUser.name}?`)) {
      return;
    }

    const res = await authService.deleteUser(targetUser.id);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
      setFeedbackMsg({ type: 'success', text: `Usuário ${targetUser.name} removido com sucesso.` });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Crown className="w-3 h-3 text-amber-600" /> Super Admin
          </span>
        );
      case 'admin':
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
            <Crown className="w-3 h-3 text-blue-600" /> Administrador
          </span>
        );
      case 'manager':
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-purple-600" /> Gestor
          </span>
        );
      case 'agent':
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <Headphones className="w-3 h-3 text-emerald-600" /> Atendente (Chat)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
            <Eye className="w-3 h-3 text-slate-500" /> Visualizador
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">Gestão de Equipe & Controle de Acesso (RBAC)</h3>
          </div>
          <p className="text-xs text-blue-200/90 max-w-2xl">
            Adicione operadores, gestores de tráfego e administradores ao workspace <strong>{tenant?.name || 'Principal'}</strong> com isolamento multi-tenant seguro e permissões granulares por função.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Convidar Membro</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Sub-Tabs: Membros vs Matriz RBAC */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewTab('members')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewTab === 'members'
                ? 'bg-white text-[#1A1D21] border border-[#E2E8F0] shadow-2xs'
                : 'text-[#64748B] hover:text-[#1A1D21]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Membros da Equipe ({users.length})</span>
          </button>

          <button
            onClick={() => setViewTab('rbac_matrix')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewTab === 'rbac_matrix'
                ? 'bg-white text-[#1A1D21] border border-[#E2E8F0] shadow-2xs'
                : 'text-[#64748B] hover:text-[#1A1D21]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Matriz de Permissões por Papel</span>
          </button>
        </div>

        {viewTab === 'members' && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-blue-500 outline-hidden w-56"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-white rounded-lg border border-[#E2E8F0] text-slate-700 font-semibold cursor-pointer outline-hidden"
            >
              <option value="all">Todos os Papéis</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Administrador</option>
              <option value="manager">Gestor</option>
              <option value="agent">Atendente</option>
            </select>
          </div>
        )}
      </div>

      {/* VIEW 1: MEMBERS TABLE */}
      {viewTab === 'members' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FB] border-b border-[#E2E8F0] text-[#64748B] font-bold">
                <tr>
                  <th className="py-3 px-4">Usuário</th>
                  <th className="py-3 px-4">Papel / Função</th>
                  <th className="py-3 px-4">Pacote / Mensalidade</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Último Acesso</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#64748B]">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                      <span>Carregando membros da equipe...</span>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#64748B]">
                      Nenhum membro encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-[#1A1D21] block">{u.name}</span>
                            <span className="text-[11px] text-[#64748B] font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getRoleBadge(u.role)}
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u, e.target.value as UserRole)}
                            className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-slate-600 font-semibold cursor-pointer"
                          >
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Gestor</option>
                            <option value="agent">Atendente</option>
                            <option value="viewer">Visualizador</option>
                          </select>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <select
                            value={(u as any).plan || 'pro'}
                            onChange={(e) => handleChangePlan(u, e.target.value)}
                            className="text-[10px] font-bold bg-blue-50/80 text-blue-900 border border-blue-200 rounded-lg px-2 py-1 cursor-pointer"
                          >
                            {plans.map(p => (
                              <option key={p.id} value={p.slug}>
                                {p.name} (R$ {p.priceMonthly}/mês)
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            u.isActive !== false
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {u.isActive !== false ? '● Ativo' : '○ Inativo'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-[11px] text-[#64748B] font-mono">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('pt-BR') : 'Nunca logou'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remover Usuário"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: RBAC MATRIX */}
      {viewTab === 'rbac_matrix' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden p-6 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-[#1A1D21]">Tabela de Permissões por Nível de Acesso (RBAC)</h4>
            <p className="text-xs text-[#64748B]">
              Entenda exatamente o que cada perfil de usuário tem autorização para visualizar e editar no ecossistema ManyFlow.
            </p>
          </div>

          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#F8F9FB] border-b border-[#E2E8F0] text-[#64748B] font-bold">
                <tr>
                  <th className="py-2.5 px-4">Recurso / Módulo</th>
                  <th className="py-2.5 px-3 text-center">Super Admin</th>
                  <th className="py-2.5 px-3 text-center">Admin</th>
                  <th className="py-2.5 px-3 text-center">Gestor de Agência</th>
                  <th className="py-2.5 px-3 text-center">Atendente (Chat)</th>
                  <th className="py-2.5 px-3 text-center">Visualizador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-800">Editor Visual de Fluxos & IA</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">✕ Somente Leitura</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">✕ Somente Leitura</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-800">Gatilhos de Palavras & Comentários</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">✕ Restrito</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">✕ Restrito</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-800">Atendimento ao Vivo (Inbox / Directs)</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">✕ Somente Leitura</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-800">Campanhas de Transmissão (Broadcast)</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">✕ Restrito</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">✕ Restrito</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-800">Configuração de Domínios & White-Label</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">✕ Restrito</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">✕ Restrito</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">✕ Restrito</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-800">Gerenciar Usuários & Equipe</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">✕ Restrito</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">✕ Restrito</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">✕ Restrito</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVITE MEMBER MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Convidar Novo Membro da Equipe</h3>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="m-5 mb-0 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleInviteUser} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: João Vitor"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email de Acesso</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="joao@suaempresa.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Papel / Nível de Acesso</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 font-semibold cursor-pointer outline-hidden"
                >
                  <option value="admin">Administrador (Controle Total)</option>
                  <option value="manager">Gestor de Tráfego / Agência (Fluxos, Disparos & CRM)</option>
                  <option value="agent">Atendente (Live Chat & Atendimento ao Vivo)</option>
                  <option value="viewer">Visualizador (Somente Leitura)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Senha Inicial Temporária</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">O membro poderá alterar a senha após o primeiro login.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Confirmar Convite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
