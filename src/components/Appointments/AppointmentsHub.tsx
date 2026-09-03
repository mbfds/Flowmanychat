import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Instagram, 
  Facebook, 
  MessageCircle, 
  Send, 
  Globe, 
  ExternalLink, 
  Sparkles, 
  User, 
  ChevronRight, 
  Check, 
  Play, 
  Settings, 
  Bell, 
  X,
  Layers,
  CalendarCheck,
  Zap,
  Tag
} from 'lucide-react';
import { 
  Appointment, 
  ChannelBookingConfig, 
  AppointmentService, 
  ChannelType, 
  AppointmentStatus 
} from '../../types';
import { 
  INITIAL_APPOINTMENTS, 
  DEMO_APPOINTMENTS,
  INITIAL_CHANNEL_BOOKING_CONFIGS, 
  INITIAL_APPOINTMENT_SERVICES 
} from '../../data/initialData';
import { useAuth } from '../../context/AuthContext';

interface AppointmentsHubProps {
  onOpenSimulator?: (flowId?: string) => void;
  onNavigateToFlows?: (flowId: string) => void;
}

export const AppointmentsHub: React.FC<AppointmentsHubProps> = ({
  onOpenSimulator,
  onNavigateToFlows
}) => {
  const { user } = useAuth();
  const isDemo = !user || user.email === 'demo@manyflow.com' || Boolean(user.isDemo);

  const [activeTab, setActiveTab] = useState<'appointments' | 'calendar' | 'channel_configs' | 'services'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>(() => isDemo ? DEMO_APPOINTMENTS : INITIAL_APPOINTMENTS);
  const [channelConfigs, setChannelConfigs] = useState<ChannelBookingConfig[]>(INITIAL_CHANNEL_BOOKING_CONFIGS);
  const [services, setServices] = useState<AppointmentService[]>(INITIAL_APPOINTMENT_SERVICES);

  // Filters
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<ChannelType | 'all'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for new appointment
  const [newContactName, setNewContactName] = useState('');
  const [newContactHandle, setNewContactHandle] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newChannel, setNewChannel] = useState<ChannelType>('instagram');
  const [newServiceTitle, setNewServiceTitle] = useState(services[0]?.title || '🎯 Demonstração ManyFlow VIP');
  const [newDate, setNewDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('10:00');
  const [newNotes, setNewNotes] = useState('');

  // Reschedule state
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (selectedChannelFilter !== 'all' && apt.channel !== selectedChannelFilter) return false;
    if (selectedStatusFilter !== 'all' && apt.status !== selectedStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = apt.contactName.toLowerCase().includes(q);
      const matchHandle = apt.contactHandle?.toLowerCase().includes(q);
      const matchService = apt.serviceTitle.toLowerCase().includes(q);
      const matchEmail = apt.contactEmail?.toLowerCase().includes(q);
      if (!matchName && !matchHandle && !matchService && !matchEmail) return false;
    }
    return true;
  });

  // Calculate Metrics
  const totalCount = appointments.length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    const matchedService = services.find((s) => s.title === newServiceTitle) || services[0];
    const newApt: Appointment = {
      id: `apt_${Date.now()}`,
      contactId: `c_${Date.now()}`,
      contactName: newContactName,
      contactHandle: newContactHandle || undefined,
      contactPhone: newContactPhone || undefined,
      contactEmail: newContactEmail || undefined,
      channel: newChannel,
      serviceTitle: matchedService?.title || '🎯 Atendimento',
      serviceDurationMinutes: matchedService?.durationMinutes || 30,
      scheduledDate: newDate,
      scheduledTime: newTime,
      status: 'confirmed',
      notes: newNotes || undefined,
      meetingLink: 'https://meet.google.com/manyflow-auto',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reminderSent24h: false,
      reminderSent2h: false
    };

    setAppointments((prev) => [newApt, ...prev]);
    setIsNewAppointmentModalOpen(false);
    // Reset form
    setNewContactName('');
    setNewContactHandle('');
    setNewContactPhone('');
    setNewContactEmail('');
    setNewNotes('');

    showToast(`✅ Agendamento criado com sucesso! Confirmação enviada via ${getChannelLabel(newChannel)}.`);
  };

  const handleUpdateStatus = (id: string, newStatus: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus, updatedAt: new Date().toISOString() } : apt))
    );
    const statusLabels: Record<AppointmentStatus, string> = {
      confirmed: 'Confirmado',
      pending: 'Pendente',
      completed: 'Concluído',
      rescheduled: 'Reagendado',
      cancelled: 'Cancelado'
    };
    showToast(`Status atualizado para: ${statusLabels[newStatus]}`);
  };

  const handleSendManualReminder = (apt: Appointment) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === apt.id ? { ...a, reminderSent24h: true, updatedAt: new Date().toISOString() } : a
      )
    );
    showToast(`🔔 Lembrete de agendamento enviado com sucesso para ${apt.contactName} via ${getChannelLabel(apt.channel)}!`);
  };

  const handleOpenReschedule = (apt: Appointment) => {
    setAppointmentToEdit(apt);
    setRescheduleDate(apt.scheduledDate);
    setRescheduleTime(apt.scheduledTime);
    setIsRescheduleModalOpen(true);
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentToEdit || !rescheduleDate || !rescheduleTime) return;

    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentToEdit.id
          ? {
              ...apt,
              scheduledDate: rescheduleDate,
              scheduledTime: rescheduleTime,
              status: 'rescheduled',
              updatedAt: new Date().toISOString()
            }
          : apt
      )
    );
    setIsRescheduleModalOpen(false);
    setAppointmentToEdit(null);
    showToast(`📅 Reagendamento salvo para ${rescheduleDate} às ${rescheduleTime}. Notificação enviada ao contato.`);
  };

  const toggleChannelConfig = (channel: ChannelType) => {
    setChannelConfigs((prev) =>
      prev.map((c) =>
        c.channel === channel ? { ...c, enabled: !c.enabled } : c
      )
    );
    showToast(`Configuração de agendamento do canal atualizada.`);
  };

  const toggleAutoConfirm = (channel: ChannelType) => {
    setChannelConfigs((prev) =>
      prev.map((c) =>
        c.channel === channel ? { ...c, autoConfirm: !c.autoConfirm } : c
      )
    );
    showToast(`Modo de confirmação automática atualizado.`);
  };

  const getChannelIcon = (channel: ChannelType) => {
    switch (channel) {
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-emerald-600" />;
      case 'messenger':
        return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'telegram':
        return <Send className="w-4 h-4 text-sky-500" />;
      default:
        return <Globe className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getChannelBadge = (channel: ChannelType) => {
    switch (channel) {
      case 'instagram':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-200">
            <Instagram className="w-3 h-3 text-pink-600" />
            Instagram Direct
          </span>
        );
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <MessageCircle className="w-3 h-3 text-emerald-600" />
            WhatsApp
          </span>
        );
      case 'messenger':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Facebook className="w-3 h-3 text-blue-600" />
            Messenger
          </span>
        );
      case 'telegram':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Send className="w-3 h-3 text-sky-500" />
            Telegram
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Globe className="w-3 h-3 text-indigo-600" />
            Live Chat
          </span>
        );
    }
  };

  const getChannelLabel = (channel: ChannelType) => {
    switch (channel) {
      case 'instagram':
        return 'Instagram Direct';
      case 'whatsapp':
        return 'WhatsApp';
      case 'messenger':
        return 'Facebook Messenger';
      case 'telegram':
        return 'Telegram';
      default:
        return 'Live Chat';
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Confirmado
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Pendente
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Check className="w-3 h-3 text-blue-600" />
            Concluído
          </span>
        );
      case 'rescheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <RefreshCw className="w-3 h-3 text-purple-600" />
            Reagendado
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Cancelado
          </span>
        );
    }
  };

  return (
    <div id="appointments_hub_container" className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] dark:bg-slate-950 overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Agendamentos & Calendário Inteligente
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Agendamento pré-definido e ativo em tempo real em <strong>todos os canais de atendimento</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="btn_test_booking_simulator"
              onClick={() => onOpenSimulator && onOpenSimulator('flow_appointment_booking')}
              className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Testar Fluxo no Simulador</span>
            </button>

            {onNavigateToFlows && (
              <button
                id="btn_view_booking_flow"
                onClick={() => onNavigateToFlows('flow_appointment_booking')}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Editar Fluxo do Bot</span>
              </button>
            )}

            <button
              id="btn_new_manual_appointment"
              onClick={() => setIsNewAppointmentModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento Manual</span>
            </button>
          </div>
        </div>

        {/* Omnichannel Pre-definition Status Banner */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-emerald-50/80 dark:from-slate-800/80 dark:via-indigo-950/40 dark:to-slate-800/80 border border-blue-200/80 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0 mt-0.5 shadow-xs">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Agendamento Pré-Definido & Ativo em Todos os Canais
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  5/5 CANAIS CONECTADOS
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                Qualquer cliente que solicitar agendamento ou digitar <em>"agendar"</em> no <strong>Instagram</strong>, <strong>WhatsApp</strong>, <strong>Facebook</strong> ou <strong>Telegram</strong> receberá automaticamente as opções de horários e confirmação imediata.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            {channelConfigs.map((cfg) => (
              <div 
                key={cfg.channel}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
                title={`${cfg.channelName}: ${cfg.totalBookings} agendamentos`}
              >
                {getChannelIcon(cfg.channel)}
                <span className="text-[11px] text-slate-700 dark:text-slate-200">{cfg.channelName.split(' ')[0]}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            ))}
          </div>
        </div>

        {/* High-level KPI summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Agendamentos
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {totalCount}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              +18% esta semana
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
            <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Confirmados
            </div>
            <div className="text-xl font-black text-emerald-800 dark:text-emerald-300 mt-1">
              {confirmedCount}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              Show Rate estimado: 92.4%
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Pendentes de Confirmação
            </div>
            <div className="text-xl font-black text-amber-800 dark:text-amber-300 mt-1">
              {pendingCount}
            </div>
            <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
              Aguardando resposta do lead
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
            <div className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Atendimentos Concluídos
            </div>
            <div className="text-xl font-black text-blue-800 dark:text-blue-300 mt-1">
              {completedCount}
            </div>
            <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
              Histórico arquivado no CRM
            </div>
          </div>
        </div>

        {/* View Selection Tabs */}
        <div className="flex items-center gap-2 mt-5 border-b border-slate-100 dark:border-slate-800 -mb-4 pb-0">
          <button
            id="tab_view_appointments"
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'appointments'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Lista de Agendamentos ({filteredAppointments.length})</span>
          </button>

          <button
            id="tab_view_calendar"
            onClick={() => setActiveTab('calendar')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Visão de Grade & Agenda</span>
          </button>

          <button
            id="tab_view_channel_configs"
            onClick={() => setActiveTab('channel_configs')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'channel_configs'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configuração por Canal ({channelConfigs.length})</span>
          </button>

          <button
            id="tab_view_services"
            onClick={() => setActiveTab('services')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'services'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Catálogo de Serviços ({services.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6 space-y-6">
        {/* =========================================================================
            TAB 1: APPOINTMENTS LIST TABLE
        ========================================================================= */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="input_search_appointments"
                  type="text"
                  placeholder="Buscar por contato, @arroba, telefone ou serviço..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                  <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Canal:</span>
                  <button
                    onClick={() => setSelectedChannelFilter('all')}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      selectedChannelFilter === 'all'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setSelectedChannelFilter('instagram')}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                      selectedChannelFilter === 'instagram'
                        ? 'bg-white dark:bg-slate-900 text-pink-600 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-pink-600'
                    }`}
                  >
                    <Instagram className="w-3 h-3" />
                    <span>Instagram</span>
                  </button>
                  <button
                    onClick={() => setSelectedChannelFilter('whatsapp')}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                      selectedChannelFilter === 'whatsapp'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                    }`}
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setSelectedChannelFilter('messenger')}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                      selectedChannelFilter === 'messenger'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
                    }`}
                  >
                    <Facebook className="w-3 h-3" />
                    <span>Messenger</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                  <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Status:</span>
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                    className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 border-none outline-none pr-2 cursor-pointer"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="confirmed">Confirmados</option>
                    <option value="pending">Pendentes</option>
                    <option value="completed">Concluídos</option>
                    <option value="rescheduled">Reagendados</option>
                    <option value="cancelled">Cancelados</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Lead / Contato</th>
                      <th className="py-3.5 px-4">Canal de Origem</th>
                      <th className="py-3.5 px-4">Serviço / Duração</th>
                      <th className="py-3.5 px-4">Data & Horário</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Lembrete Automático</th>
                      <th className="py-3.5 px-4 text-right">Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                          <p className="font-bold text-slate-600 dark:text-slate-300">Nenhum agendamento encontrado</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Tente ajustar os filtros ou crie um agendamento manual.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          {/* Contact Info */}
                          <td className="py-3.5 px-4">
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{apt.contactName}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                                {apt.contactHandle && <span>{apt.contactHandle}</span>}
                                {apt.contactPhone && <span>• {apt.contactPhone}</span>}
                              </div>
                              {apt.notes && (
                                <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-1 max-w-xs">
                                  "{apt.notes}"
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Channel */}
                          <td className="py-3.5 px-4">
                            {getChannelBadge(apt.channel)}
                          </td>

                          {/* Service */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {apt.serviceTitle}
                            </div>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {apt.serviceDurationMinutes} minutos
                            </span>
                          </td>

                          {/* Date & Time */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-blue-500" />
                              <span>{apt.scheduledDate}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{apt.scheduledTime} (Horário de Brasília)</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {getStatusBadge(apt.status)}
                          </td>

                          {/* Reminder Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-[11px]">
                                <span className={`w-2 h-2 rounded-full ${apt.reminderSent24h ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                <span className={apt.reminderSent24h ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                                  24h antes: {apt.reminderSent24h ? 'Enviado' : 'Agendado'}
                                </span>
                              </div>
                              <button
                                onClick={() => handleSendManualReminder(apt)}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Bell className="w-2.5 h-2.5" />
                                <span>Enviar lembrete agora</span>
                              </button>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {apt.meetingLink && (
                                <a
                                  href={apt.meetingLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                                  title="Abrir Sala / Link da Reunião"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {apt.status === 'pending' && (
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors cursor-pointer"
                                  title="Confirmar Agendamento"
                                >
                                  Confirmar
                                </button>
                              )}

                              {apt.status === 'confirmed' && (
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, 'completed')}
                                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                                  title="Marcar como Concluído"
                                >
                                  Concluir
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenReschedule(apt)}
                                className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer"
                                title="Reagendar Data / Horário"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>

                              {apt.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                  title="Cancelar Agendamento"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: CALENDAR VIEW
        ========================================================================= */}
        {activeTab === 'calendar' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Grade de Horários & Disponibilidade Integrada
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualização dos slots ocupados e livres sincronizados automaticamente com os robôs de atendimento.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Sincronização Google Calendar: Ativa
                </span>
              </div>
            </div>

            {/* Days row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {['Hoje', 'Amanhã', 'Quinta-feira', 'Sexta-feira', 'Segunda-feira'].map((dayLabel, idx) => {
                const dayDate = new Date(Date.now() + idx * 86400000).toISOString().split('T')[0];
                const dayApts = appointments.filter((a) => a.scheduledDate === dayDate || (idx === 0 && a.scheduledDate === new Date().toISOString().split('T')[0]));

                return (
                  <div key={dayLabel} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between min-h-[220px]">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{dayLabel}</span>
                        <span className="text-[10px] font-mono text-slate-400">{dayDate.slice(5)}</span>
                      </div>

                      <div className="mt-2.5 space-y-2">
                        {dayApts.length === 0 ? (
                          <div className="py-6 text-center text-[11px] text-slate-400 italic">
                            4 horários livres
                          </div>
                        ) : (
                          dayApts.map((apt) => (
                            <div 
                              key={apt.id}
                              className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1"
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-blue-500" />
                                  {apt.scheduledTime}
                                </span>
                                {getChannelIcon(apt.channel)}
                              </div>
                              <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {apt.contactName}
                              </p>
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-400 truncate max-w-[90px]">{apt.serviceTitle.split(' ')[1]}</span>
                                {getStatusBadge(apt.status)}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-center">
                      <button
                        onClick={() => {
                          setNewDate(dayDate);
                          setIsNewAppointmentModalOpen(true);
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 cursor-pointer flex items-center justify-center gap-1 w-full"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Adicionar Horário</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: CHANNEL BOOKING CONFIGS
        ========================================================================= */}
        {activeTab === 'channel_configs' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pré-definição de Agendamento por Canal
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Defina como cada canal conectado (Instagram, WhatsApp, Messenger, etc.) recebe, processa e confirma os agendamentos.
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                Sincronismo Global Ativo
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channelConfigs.map((cfg) => (
                <div 
                  key={cfg.channel}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {getChannelIcon(cfg.channel)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{cfg.channelName}</h4>
                          <span className="text-xs text-slate-500 font-mono">{cfg.channelHandleOrNumber}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleChannelConfig(cfg.channel)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          cfg.enabled
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-500 border border-slate-300'
                        }`}
                      >
                        {cfg.enabled ? '● Ativo no Canal' : '○ Desativado'}
                      </button>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Fluxo Vinculado:</span>
                        <span className="font-semibold text-blue-600 font-mono">📅 {cfg.defaultFlowId}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Confirmação Automática:</span>
                        <button
                          onClick={() => toggleAutoConfirm(cfg.channel)}
                          className="font-bold text-xs text-emerald-600 hover:underline cursor-pointer"
                        >
                          {cfg.autoConfirm ? 'Sim (Imediato)' : 'Manual (Aprovar)'}
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Total de Agendamentos:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{cfg.totalBookings}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Último Agendamento:</span>
                        <span className="text-slate-500">{cfg.lastBookingAt || 'Recentemente'}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Palavras-Chave de Disparo Pré-Definidas:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {cfg.triggerKeywords.map((kw) => (
                          <span key={kw} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <button
                      onClick={() => onOpenSimulator && onOpenSimulator(cfg.defaultFlowId)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3 h-3" />
                      <span>Testar neste Canal</span>
                    </button>

                    {onNavigateToFlows && (
                      <button
                        onClick={() => onNavigateToFlows(cfg.defaultFlowId)}
                        className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                        title="Ver Fluxo no FlowBuilder"
                      >
                        <Zap className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: SERVICES CATALOG
        ========================================================================= */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tipos de Atendimento & Serviços Ofertados
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Estes serviços são exibidos como botões interativos no chatbot de todos os canais quando o cliente solicita um agendamento.
                </p>
              </div>

              <button
                onClick={() => {
                  const title = prompt('Nome do novo serviço de agendamento (ex: Mentoria VIP 1h):');
                  if (!title) return;
                  const newSrv: AppointmentService = {
                    id: `srv_${Date.now()}`,
                    title,
                    description: 'Atendimento especializado agendado via canal automático ManyFlow.',
                    durationMinutes: 45,
                    price: 'Sob Consulta',
                    active: true,
                    color: 'indigo'
                  };
                  setServices((prev) => [...prev, newSrv]);
                  showToast(`Serviço "${title}" adicionado ao catálogo!`);
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Serviço</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {services.map((srv) => (
                <div 
                  key={srv.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {srv.durationMinutes} min
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        {srv.price || 'Gratuito'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2.5">
                      {srv.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Disponível nos 5 canais</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3 h-3" />
                      Ativo no Bot
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: NOVO AGENDAMENTO MANUAL
      ========================================================================= */}
      {isNewAppointmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Criar Novo Agendamento</h3>
              </div>
              <button 
                onClick={() => setIsNewAppointmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Lead / Cliente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva ou Camila Ribeiro"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Canal de Atendimento *
                  </label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as ChannelType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="instagram">📸 Instagram Direct</option>
                    <option value="whatsapp">🟢 WhatsApp Oficial</option>
                    <option value="messenger">💬 Facebook Messenger</option>
                    <option value="telegram">✈️ Telegram Bot</option>
                    <option value="omnichannel">🌐 Live Chat / Webchat</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    @Arroba ou Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="@usuario ou (11) 98765-4321"
                    value={newContactHandle}
                    onChange={(e) => setNewContactHandle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Serviço Selecionado *
                </label>
                <select
                  value={newServiceTitle}
                  onChange={(e) => setNewServiceTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title} ({s.durationMinutes} min - {s.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Horário *
                  </label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Observações / Contexto
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Cliente tem interesse no plano Pro anual e gostaria de ver integração de direct."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAppointmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-sm"
                >
                  Salvar & Enviar Confirmação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REAGENDAMENTO DE HORÁRIO
      ========================================================================= */}
      {isRescheduleModalOpen && appointmentToEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Reagendar Horário</h3>
              </div>
              <button 
                onClick={() => setIsRescheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReschedule} className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">{appointmentToEdit.contactName}</div>
                <div className="text-slate-500">{appointmentToEdit.serviceTitle}</div>
                <div className="text-slate-400 text-[11px]">Canal: {getChannelLabel(appointmentToEdit.channel)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nova Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Novo Horário *
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Ao confirmar, uma mensagem automática de reagendamento será enviada ao lead no canal de atendimento correspondente.
              </p>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRescheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer shadow-sm"
                >
                  Salvar & Notificar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
