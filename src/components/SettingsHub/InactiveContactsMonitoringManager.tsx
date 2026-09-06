import React, { useState, useMemo } from 'react';
import { 
  BellRing, 
  Mail, 
  Slack, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  Send, 
  Settings2, 
  Users, 
  Tag, 
  ExternalLink, 
  Check, 
  Info,
  ChevronRight,
  Flame,
  ArrowRight,
  Activity,
  Workflow
} from 'lucide-react';
import { Contact, Flow } from '../../types';
import { getContactDaysInactive, formatInactivityBadge } from '../../utils/inactivityHelper';

export interface InactiveMonitoringRule {
  id: string;
  name: string;
  enabled: boolean;
  inactivityDaysThreshold: number;
  targetAudience: 'all' | 'hot_only' | 'warm_or_hot' | 'customers' | 'custom_tag';
  targetTag?: string;
  notificationChannels: {
    email: {
      enabled: boolean;
      recipients: string[];
      subjectTemplate?: string;
    };
    slack: {
      enabled: boolean;
      webhookUrl: string;
      channelName: string;
      notifyChannel: boolean;
    };
  };
  automatedActions: {
    applyTagOnLead?: string;
    assignToTeamMember?: string;
    triggerRecoveryFlowId?: string;
  };
  frequency: 'daily' | 'weekly';
  lastRunAt?: string;
  leadsDetectedCount?: number;
  lastNotificationStatus?: 'success' | 'failed' | 'idle';
}

const DEFAULT_MONITORING_RULES: InactiveMonitoringRule[] = [
  {
    id: 'rule_hot_leads_alert',
    name: 'Alerta Crítico: Leads Quentes sem Contato > 15 dias',
    enabled: true,
    inactivityDaysThreshold: 15,
    targetAudience: 'hot_only',
    notificationChannels: {
      email: {
        enabled: true,
        recipients: ['gestor.comercial@manyflow.com.br', 'vendas@manyflow.com.br'],
        subjectTemplate: '[URGENTE] {{total_leads}} Leads Quentes estão sem contato há mais de {{dias}} dias!'
      },
      slack: {
        enabled: true,
        webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
        channelName: '#vendas-urgente',
        notifyChannel: true
      }
    },
    automatedActions: {
      applyTagOnLead: 'alerta_risco_churn',
      assignToTeamMember: 'Coordenador Comercial',
      triggerRecoveryFlowId: 'flow-1'
    },
    frequency: 'daily',
    lastRunAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    leadsDetectedCount: 3,
    lastNotificationStatus: 'success'
  },
  {
    id: 'rule_general_inactivity_30d',
    name: 'Monitoramento Geral: Contatos Inativos > 30 dias',
    enabled: true,
    inactivityDaysThreshold: 30,
    targetAudience: 'all',
    notificationChannels: {
      email: {
        enabled: true,
        recipients: ['marketing@manyflow.com.br'],
        subjectTemplate: 'Relatório Semanal ManyFlow: {{total_leads}} leads inativos detectados'
      },
      slack: {
        enabled: false,
        webhookUrl: '',
        channelName: '#leads-inativos',
        notifyChannel: false
      }
    },
    automatedActions: {
      applyTagOnLead: 'inativo_30d_monitorado',
      triggerRecoveryFlowId: 'flow-2'
    },
    frequency: 'weekly',
    lastRunAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    leadsDetectedCount: 14,
    lastNotificationStatus: 'success'
  },
  {
    id: 'rule_dormant_leads_90d',
    name: 'Notificação para Higienização de Base > 90 dias',
    enabled: false,
    inactivityDaysThreshold: 90,
    targetAudience: 'all',
    notificationChannels: {
      email: {
        enabled: true,
        recipients: ['admin@manyflow.com.br'],
        subjectTemplate: 'Alerta de Otimização: Base com {{total_leads}} contatos há mais de 90 dias inativos'
      },
      slack: {
        enabled: true,
        webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/YYYYYYYYYYYYYYYYYYYYYYYY',
        channelName: '#crm-governance',
        notifyChannel: false
      }
    },
    automatedActions: {
      applyTagOnLead: 'pronto_para_descarte'
    },
    frequency: 'weekly',
    lastRunAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    leadsDetectedCount: 27,
    lastNotificationStatus: 'idle'
  }
];

interface InactiveContactsMonitoringManagerProps {
  contacts?: Contact[];
  flows?: Flow[];
}

export const InactiveContactsMonitoringManager: React.FC<InactiveContactsMonitoringManagerProps> = ({
  contacts = [],
  flows = []
}) => {
  const [rules, setRules] = useState<InactiveMonitoringRule[]>(() => {
    try {
      const saved = localStorage.getItem('manyflow_inactive_monitoring_rules');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_MONITORING_RULES;
  });

  const [editingRule, setEditingRule] = useState<InactiveMonitoringRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [testNotificationFeedback, setTestNotificationFeedback] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
    matchesCount?: number;
  } | null>(null);
  const [simulatedMatches, setSimulatedMatches] = useState<{ ruleId: string; matches: Contact[] } | null>(null);

  // Save helper
  const persistRules = (newRules: InactiveMonitoringRule[]) => {
    setRules(newRules);
    try {
      localStorage.setItem('manyflow_inactive_monitoring_rules', JSON.stringify(newRules));
    } catch (e) {
      console.error('Error saving monitoring rules:', e);
    }
  };

  const handleToggleRule = (id: string) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    persistRules(updated);
  };

  const handleDeleteRule = (id: string) => {
    if (window.confirm('Tem certeza de que deseja remover esta regra de monitoramento?')) {
      const updated = rules.filter((r) => r.id !== id);
      persistRules(updated);
    }
  };

  const handleOpenCreate = () => {
    const newRule: InactiveMonitoringRule = {
      id: `rule_${Date.now()}`,
      name: 'Nova Regra de Inatividade',
      enabled: true,
      inactivityDaysThreshold: 30,
      targetAudience: 'all',
      notificationChannels: {
        email: {
          enabled: true,
          recipients: ['notificacoes@suaempresa.com.br'],
          subjectTemplate: '[Alerta ManyFlow] {{total_leads}} leads inativos há mais de {{dias}} dias'
        },
        slack: {
          enabled: false,
          webhookUrl: '',
          channelName: '#alertas-crm',
          notifyChannel: false
        }
      },
      automatedActions: {
        applyTagOnLead: 'alerta_inatividade'
      },
      frequency: 'daily'
    };
    setEditingRule(newRule);
    setEmailInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: InactiveMonitoringRule) => {
    setEditingRule({ ...rule });
    setEmailInput('');
    setIsModalOpen(true);
  };

  const handleSaveRule = () => {
    if (!editingRule) return;

    // Validate
    if (!editingRule.name.trim()) {
      alert('Por favor, informe um nome para a regra.');
      return;
    }

    if (
      !editingRule.notificationChannels.email.enabled &&
      !editingRule.notificationChannels.slack.enabled
    ) {
      alert('Ative ao menos um canal de notificação (E-mail ou Slack).');
      return;
    }

    const exists = rules.some((r) => r.id === editingRule.id);
    const updated = exists
      ? rules.map((r) => (r.id === editingRule.id ? editingRule : r))
      : [editingRule, ...rules];

    persistRules(updated);
    setIsModalOpen(false);
    setEditingRule(null);
  };

  // Evaluate which real contacts in the database match a rule
  const evaluateRuleMatches = (rule: InactiveMonitoringRule): Contact[] => {
    return contacts.filter((c) => {
      const days = getContactDaysInactive(c);
      if (days < rule.inactivityDaysThreshold) return false;

      if (rule.targetAudience === 'hot_only') {
        return c.scoreTier === 'hot';
      }
      if (rule.targetAudience === 'warm_or_hot') {
        return c.scoreTier === 'hot' || c.scoreTier === 'warm';
      }
      if (rule.targetAudience === 'customers') {
        return (c.lifetimeValue || 0) > 0 || c.tags.some((t) => t.toLowerCase().includes('cliente'));
      }
      if (rule.targetAudience === 'custom_tag' && rule.targetTag) {
        return c.tags.includes(rule.targetTag);
      }
      return true;
    });
  };

  // Test Run Rule
  const handleTestRunRule = (rule: InactiveMonitoringRule) => {
    const matchedContacts = evaluateRuleMatches(rule);
    setSimulatedMatches({ ruleId: rule.id, matches: matchedContacts });

    // Update rule metadata
    const updated = rules.map((r) =>
      r.id === rule.id
        ? {
            ...r,
            lastRunAt: new Date().toISOString(),
            leadsDetectedCount: matchedContacts.length,
            lastNotificationStatus: 'success' as const
          }
        : r
    );
    persistRules(updated);

    const channels: string[] = [];
    if (rule.notificationChannels.email.enabled) {
      channels.push(`E-mail (${rule.notificationChannels.email.recipients.join(', ')})`);
    }
    if (rule.notificationChannels.slack.enabled) {
      channels.push(`Slack (${rule.notificationChannels.slack.channelName || 'Webhook'})`);
    }

    setTestNotificationFeedback({
      message: `Regra avaliada com sucesso! ${matchedContacts.length} contatos inativos detectados (> ${rule.inactivityDaysThreshold} dias). Notificação simulada disparada para: ${channels.join(' e ')}.`,
      type: 'success',
      matchesCount: matchedContacts.length
    });

    setTimeout(() => {
      setTestNotificationFeedback(null);
    }, 6000);
  };

  // Recipient email helpers inside editor
  const handleAddEmailRecipient = () => {
    if (!editingRule || !emailInput.trim()) return;
    const email = emailInput.trim().toLowerCase();
    if (!email.includes('@')) {
      alert('Insira um e-mail válido.');
      return;
    }
    const current = editingRule.notificationChannels.email.recipients || [];
    if (!current.includes(email)) {
      setEditingRule({
        ...editingRule,
        notificationChannels: {
          ...editingRule.notificationChannels,
          email: {
            ...editingRule.notificationChannels.email,
            recipients: [...current, email]
          }
        }
      });
    }
    setEmailInput('');
  };

  const handleRemoveEmailRecipient = (emailToRemove: string) => {
    if (!editingRule) return;
    const current = editingRule.notificationChannels.email.recipients || [];
    setEditingRule({
      ...editingRule,
      notificationChannels: {
        ...editingRule.notificationChannels,
        email: {
          ...editingRule.notificationChannels.email,
          recipients: current.filter((e) => e !== emailToRemove)
        }
      }
    });
  };

  return (
    <div id="panel_inactive_contacts_monitoring" className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-slate-900/5 border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <BellRing className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Regras Automáticas de Monitoramento de Contatos Inativos
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
              Email &amp; Slack
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Configure sentinelas automáticas para monitorar leads que param de interagir por mais de <strong>X dias</strong>. 
            Receba relatórios em tempo real no canal do seu time no <strong>Slack</strong> ou por <strong>E-mail</strong> antes que o cliente dê churn.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn_create_monitoring_rule"
            type="button"
            onClick={handleOpenCreate}
            className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Regra</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {testNotificationFeedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs text-emerald-900 font-semibold flex-1">
            {testNotificationFeedback.message}
          </div>
          <button
            type="button"
            onClick={() => setTestNotificationFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Rules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Regras Ativas ({rules.filter((r) => r.enabled).length} de {rules.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            {contacts.length} contatos avaliados em tempo real
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {rules.map((rule) => {
            const matchesCount = evaluateRuleMatches(rule).length;

            return (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border transition-all ${
                  rule.enabled
                    ? 'bg-white border-slate-200 hover:border-amber-300 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 opacity-75'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Rule Info */}
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">
                        {rule.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        &gt; {rule.inactivityDaysThreshold} dias sem contato
                      </span>
                      {rule.targetAudience === 'hot_only' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-600" />
                          Apenas Leads Quentes
                        </span>
                      )}
                      {rule.frequency && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {rule.frequency === 'daily' ? 'Verificação Diária' : 'Semanal'}
                        </span>
                      )}
                    </div>

                    {/* Channels & Automations Indicators */}
                    <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                      {/* Email Indicator */}
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                        rule.notificationChannels.email.enabled
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Mail className="w-3 h-3" />
                        <span>
                          {rule.notificationChannels.email.enabled
                            ? `E-mail: ${rule.notificationChannels.email.recipients.length} destinatários`
                            : 'E-mail desativado'}
                        </span>
                      </div>

                      {/* Slack Indicator */}
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                        rule.notificationChannels.slack.enabled
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Slack className="w-3 h-3" />
                        <span>
                          {rule.notificationChannels.slack.enabled
                            ? `Slack: ${rule.notificationChannels.slack.channelName || 'Webhook Ativo'}`
                            : 'Slack desativado'}
                        </span>
                      </div>

                      {/* Automated Tag */}
                      {rule.automatedActions.applyTagOnLead && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span>Aplica tag: <code className="text-slate-700 font-bold bg-slate-100 px-1 rounded">{rule.automatedActions.applyTagOnLead}</code></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Live Detection Metric & Action Buttons */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-black text-amber-900">
                          {matchesCount}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          {matchesCount === 1 ? 'lead afetado' : 'leads afetados'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {rule.lastRunAt ? `Último envio: ${new Date(rule.lastRunAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Aguardando agendamento'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Test Run Button */}
                      <button
                        type="button"
                        onClick={() => handleTestRunRule(rule)}
                        className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Simular disparo de alerta imediato para E-mail e Slack"
                      >
                        <Play className="w-3 h-3 text-slate-600 fill-slate-600" />
                        <span>Testar</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(rule)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                        title="Editar regra"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Excluir regra"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Enable/Disable Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleRule(rule.id)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ml-1 ${
                          rule.enabled ? 'bg-amber-600' : 'bg-slate-300'
                        }`}
                        title={rule.enabled ? 'Desativar regra' : 'Ativar regra'}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                            rule.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated Matches Drawer preview */}
                {simulatedMatches?.ruleId === rule.id && (
                  <div className="mt-4 pt-3 border-t border-slate-100 animate-in fade-in">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                        <span>Amostra de Leads Detectados nesta Regra ({simulatedMatches.matches.length}):</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSimulatedMatches(null)}
                        className="text-[11px] text-slate-400 hover:text-slate-700 font-semibold"
                      >
                        Ocultar amostra
                      </button>
                    </div>

                    {simulatedMatches.matches.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">
                        Nenhum lead atualmente excede o critério de {rule.inactivityDaysThreshold} dias para esta regra.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {simulatedMatches.matches.slice(0, 6).map((c) => {
                          const days = getContactDaysInactive(c);
                          const badge = formatInactivityBadge(days);
                          return (
                            <div key={c.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <img
                                  src={c.avatarUrl}
                                  alt={c.name}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 truncate">{c.name}</div>
                                  <div className="text-[10px] text-slate-500 font-mono truncate">{c.username}</div>
                                </div>
                              </div>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-800 shrink-0">
                                {badge.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Settings2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingRule.id.startsWith('rule_') && !rules.some((r) => r.id === editingRule.id)
                      ? 'Nova Regra de Inatividade'
                      : 'Editar Regra de Monitoramento'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Disparo automático de notificações para equipe de vendas e CRM
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 flex-1">
              {/* Rule Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Nome da Regra
                </label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  placeholder="Ex: Alerta de Churn - Leads sem resposta > 20 dias"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Threshold & Target Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Days Threshold */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Disparar quando inativo por mais de:</span>
                    <span className="text-amber-600 font-extrabold font-mono">
                      {editingRule.inactivityDaysThreshold} dias
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="7"
                      max="180"
                      step="1"
                      value={editingRule.inactivityDaysThreshold}
                      onChange={(e) =>
                        setEditingRule({
                          ...editingRule,
                          inactivityDaysThreshold: parseInt(e.target.value, 10)
                        })
                      }
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={editingRule.inactivityDaysThreshold}
                      onChange={(e) =>
                        setEditingRule({
                          ...editingRule,
                          inactivityDaysThreshold: Math.max(1, parseInt(e.target.value || '1', 10))
                        })
                      }
                      className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-center"
                    />
                  </div>
                </div>

                {/* Target Audience Segment */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Público-Alvo do Monitoramento
                  </label>
                  <select
                    value={editingRule.targetAudience}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        targetAudience: e.target.value as any
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="all">Todos os contatos da base</option>
                    <option value="hot_only">Apenas Leads Quentes (🔥 High Score)</option>
                    <option value="warm_or_hot">Leads Mornos ou Quentes (🔥/⚡)</option>
                    <option value="customers">Apenas Clientes (com LTV &gt; 0)</option>
                  </select>
                </div>
              </div>

              {/* CHANNEL 1: E-MAIL NOTIFICATIONS */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">Notificação por E-mail</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRule.notificationChannels.email.enabled}
                      onChange={(e) =>
                        setEditingRule({
                          ...editingRule,
                          notificationChannels: {
                            ...editingRule.notificationChannels,
                            email: {
                              ...editingRule.notificationChannels.email,
                              enabled: e.target.checked
                            }
                          }
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>

                {editingRule.notificationChannels.email.enabled && (
                  <div className="space-y-3 pt-2">
                    {/* Add Recipient */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-600">
                        Destinatários (Emails de Vendas / Gestão):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddEmailRecipient();
                            }
                          }}
                          placeholder="Digite o e-mail e clique em Adicionar"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddEmailRecipient}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Adicionar
                        </button>
                      </div>

                      {/* Recipient Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {editingRule.notificationChannels.email.recipients.map((rec) => (
                          <span
                            key={rec}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200"
                          >
                            <span>{rec}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveEmailRecipient(rec)}
                              className="text-blue-500 hover:text-blue-800 font-black cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Email Subject Template */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">
                        Assunto do E-mail (Suporta variáveis: <code>&#123;&#123;total_leads&#125;&#125;</code>, <code>&#123;&#123;dias&#125;&#125;</code>):
                      </label>
                      <input
                        type="text"
                        value={editingRule.notificationChannels.email.subjectTemplate || ''}
                        onChange={(e) =>
                          setEditingRule({
                            ...editingRule,
                            notificationChannels: {
                              ...editingRule.notificationChannels,
                              email: {
                                ...editingRule.notificationChannels.email,
                                subjectTemplate: e.target.value
                              }
                            }
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CHANNEL 2: SLACK NOTIFICATIONS */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Slack className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-slate-900">Notificação por Slack</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRule.notificationChannels.slack.enabled}
                      onChange={(e) =>
                        setEditingRule({
                          ...editingRule,
                          notificationChannels: {
                            ...editingRule.notificationChannels,
                            slack: {
                              ...editingRule.notificationChannels.slack,
                              enabled: e.target.checked
                            }
                          }
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600" />
                  </label>
                </div>

                {editingRule.notificationChannels.slack.enabled && (
                  <div className="space-y-3 pt-2">
                    {/* Slack Webhook URL */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">
                        Slack Incoming Webhook URL:
                      </label>
                      <input
                        type="url"
                        value={editingRule.notificationChannels.slack.webhookUrl}
                        onChange={(e) =>
                          setEditingRule({
                            ...editingRule,
                            notificationChannels: {
                              ...editingRule.notificationChannels,
                              slack: {
                                ...editingRule.notificationChannels.slack,
                                webhookUrl: e.target.value
                              }
                            }
                          })
                        }
                        placeholder="https://hooks.slack.com/services/T.../B.../..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                      />
                    </div>

                    {/* Slack Channel Name & @channel toggle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">
                          Canal de Destino:
                        </label>
                        <input
                          type="text"
                          value={editingRule.notificationChannels.slack.channelName}
                          onChange={(e) =>
                            setEditingRule({
                              ...editingRule,
                              notificationChannels: {
                                ...editingRule.notificationChannels,
                                slack: {
                                  ...editingRule.notificationChannels.slack,
                                  channelName: e.target.value
                                }
                              }
                            })
                          }
                          placeholder="#alertas-churn"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-5">
                        <input
                          type="checkbox"
                          id="slack_notify_channel"
                          checked={editingRule.notificationChannels.slack.notifyChannel}
                          onChange={(e) =>
                            setEditingRule({
                              ...editingRule,
                              notificationChannels: {
                                ...editingRule.notificationChannels,
                                slack: {
                                  ...editingRule.notificationChannels.slack,
                                  notifyChannel: e.target.checked
                                }
                              }
                            })
                          }
                          className="w-4 h-4 rounded text-purple-600"
                        />
                        <label htmlFor="slack_notify_channel" className="text-xs font-semibold text-slate-700">
                          Mencionar <code>@here</code> / <code>@channel</code>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AUTOMATED ACTIONS (TAG & FLOW) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">Ações Automáticas nos Leads Detectados</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">
                      Aplicar Tag Automática:
                    </label>
                    <input
                      type="text"
                      value={editingRule.automatedActions.applyTagOnLead || ''}
                      onChange={(e) =>
                        setEditingRule({
                          ...editingRule,
                          automatedActions: {
                            ...editingRule.automatedActions,
                            applyTagOnLead: e.target.value
                          }
                        })
                      }
                      placeholder="Ex: alerta_inativo_30d"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">
                      Disparar Fluxo de Reengajamento:
                    </label>
                    <select
                      value={editingRule.automatedActions.triggerRecoveryFlowId || ''}
                      onChange={(e) =>
                        setEditingRule({
                          ...editingRule,
                          automatedActions: {
                            ...editingRule.automatedActions,
                            triggerRecoveryFlowId: e.target.value || undefined
                          }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                    >
                      <option value="">Nenhum fluxo automático</option>
                      {flows.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveRule}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Regra</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
