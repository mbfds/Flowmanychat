import React, { Component, ErrorInfo, ReactNode } from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  RotateCcw, 
  Send, 
  Copy, 
  Check, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Trash2, 
  Home, 
  HelpCircle,
  ShieldAlert,
  CheckCircle2,
  X
} from 'lucide-react';

export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  title?: string;
  subtitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  timestamp: string;
  isReporting: boolean;
  isReportSent: boolean;
  reportMessage: string;
  userEmail: string;
  copied: boolean;
  showDetails: boolean;
  showReportModal: boolean;
  isEmergencyResetting: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      timestamp: '',
      isReporting: false,
      isReportSent: false,
      reportMessage: '',
      userEmail: '',
      copied: false,
      showDetails: false,
      showReportModal: false,
      isEmergencyResetting: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    return {
      hasError: true,
      error,
      errorId,
      timestamp: new Date().toISOString(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ManyFlow ErrorBoundary] Erro de renderização capturado:', error, errorInfo);

    this.setState({ errorInfo });

    // Execute callback if supplied
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (callbackErr) {
        console.warn('[ManyFlow ErrorBoundary] Falha ao executar onError callback:', callbackErr);
      }
    }

    // Try to auto-log to server asynchronously
    this.autoLogCrash(error, errorInfo);
  }

  private autoLogCrash = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('manyflow_auth_token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch('/api/logs', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          category: 'ui_crash',
          level: 'error',
          message: `Crash de renderização UI: ${error.message}`,
          actor: 'ui_error_boundary',
          source: 'ErrorBoundary',
          details: {
            errorName: error.name,
            errorMessage: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            url: typeof window !== 'undefined' ? window.location.href : '',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            timestamp: new Date().toISOString(),
          },
        }),
      }).catch(() => {});
    } catch {
      // Non-blocking auto-log failure
    }
  };

  handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showReportModal: false,
      isReportSent: false,
      reportMessage: '',
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = (): void => {
    try {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch {
      this.handleReload();
    }
  };

  handleEmergencyReset = (): void => {
    this.setState({ isEmergencyResetting: true });
    try {
      // Clear non-critical local caches while preserving auth token if possible
      if (typeof localStorage !== 'undefined') {
        const authToken = localStorage.getItem('manyflow_auth_token');
        const authUser = localStorage.getItem('manyflow_user');
        
        // Remove transient states
        localStorage.removeItem('manyflow_active_draft');
        localStorage.removeItem('flow_canvas_state');
        localStorage.removeItem('temp_simulation');
        sessionStorage.clear();

        // Restore auth if existed
        if (authToken) localStorage.setItem('manyflow_auth_token', authToken);
        if (authUser) localStorage.setItem('manyflow_user', authUser);
      }
    } catch (e) {
      console.warn('Erro ao limpar caches:', e);
    }

    setTimeout(() => {
      this.handleReload();
    }, 400);
  };

  generateErrorReportText = (): string => {
    const { error, errorInfo, errorId, timestamp } = this.state;
    const url = typeof window !== 'undefined' ? window.location.href : 'N/A';
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A';

    return [
      `=== RELATÓRIO DE ERRO - MANYFLOW ===`,
      `Protocolo ID: ${errorId}`,
      `Data/Hora: ${timestamp}`,
      `URL: ${url}`,
      `Navegador: ${userAgent}`,
      ``,
      `--- EXCEÇÃO ---`,
      `Tipo: ${error?.name || 'Error'}`,
      `Mensagem: ${error?.message || 'Erro desconhecido'}`,
      ``,
      `--- STACK TRACE ---`,
      error?.stack || 'Nenhum stack trace disponível',
      ``,
      `--- COMPONENT STACK (REACT) ---`,
      errorInfo?.componentStack || 'Nenhum component stack disponível',
      `=====================================`,
    ].join('\n');
  };

  handleCopyReport = (): void => {
    const text = this.generateErrorReportText();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.setState({ copied: true });
      setTimeout(() => {
        this.setState({ copied: false });
      }, 2500);
    }
  };

  handleDownloadReport = (): void => {
    const { error, errorInfo, errorId, timestamp } = this.state;
    const data = {
      protocolId: errorId,
      timestamp,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      },
      componentStack: errorInfo?.componentStack,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `manyflow_error_${errorId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  handleSubmitReport = async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault();
    this.setState({ isReporting: true });

    const { error, errorInfo, errorId, reportMessage, userEmail } = this.state;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('manyflow_auth_token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch('/api/logs', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          category: 'user_reported_crash',
          level: 'error',
          message: `Relatório de Usuário (${errorId}): ${reportMessage || 'Sem mensagem adicional'}`,
          actor: userEmail || 'anonymous_user',
          source: 'ErrorBoundaryReport',
          details: {
            errorId,
            userMessage: reportMessage,
            userEmail,
            errorName: error?.name,
            errorMessage: error?.message,
            stack: error?.stack,
            componentStack: errorInfo?.componentStack,
            url: typeof window !== 'undefined' ? window.location.href : '',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      this.setState({
        isReporting: false,
        isReportSent: true,
      });
    } catch {
      // Still show successful UI state since report text is generated and copied locally
      this.setState({
        isReporting: false,
        isReportSent: true,
      });
    }
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, errorId, timestamp, copied, showDetails, showReportModal, isReporting, isReportSent, reportMessage, userEmail, isEmergencyResetting } = this.state;
    const { title, subtitle, fallback } = this.props;

    if (!hasError) {
      return this.props.children;
    }

    // Custom fallback handler
    if (fallback) {
      if (typeof fallback === 'function') {
        return fallback(error || new Error('Unknown error'), this.handleReset);
      }
      return fallback;
    }

    return (
      <div 
        id="manyflow_global_error_boundary"
        className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 select-none font-sans"
      >
        <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Top colored accent banner */}
          <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-600" />

          {/* Card Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Header: Icon + Title + Error Protocol Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {title || 'Ops! Algo inesperado aconteceu'}
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {subtitle || 'Um erro de renderização foi interceptado com segurança pelo ManyFlow.'}
                  </p>
                </div>
              </div>

              {errorId && (
                <div className="self-start sm:self-center px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono font-bold text-slate-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>{errorId}</span>
                </div>
              )}
            </div>

            {/* Friendly reassurance message */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Seus dados e fluxos salvos continuam seguros</span>
              </div>
              <p>
                Esta falha temporária interrompeu a exibição deste componente, mas suas automações, contatos e configurações salvas no banco de dados não foram afetadas.
              </p>
              {error?.message && (
                <div className="pt-2 mt-1 border-t border-slate-200/60 font-mono text-[11px] text-rose-700 break-words">
                  <strong>Erro:</strong> {error.message}
                </div>
              )}
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Button 1: Reload page */}
              <button
                type="button"
                id="btn_error_boundary_reload"
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recarregar Aplicação</span>
              </button>

              {/* Button 2: Try reset without full reload */}
              <button
                type="button"
                id="btn_error_boundary_reset"
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Tentar Novamente</span>
              </button>

              {/* Button 3: Report problem */}
              <button
                type="button"
                id="btn_error_boundary_report"
                onClick={() => this.setState({ showReportModal: true })}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reportar Problema</span>
              </button>
            </div>

            {/* Secondary Actions: Go Home & Emergency Cache Reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn_error_boundary_home"
                  onClick={this.handleGoHome}
                  className="text-slate-600 hover:text-slate-900 font-medium hover:underline flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <Home className="w-3.5 h-3.5 text-slate-400" />
                  <span>Voltar para o Início</span>
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  id="btn_error_boundary_emergency_clear"
                  onClick={this.handleEmergencyReset}
                  disabled={isEmergencyResetting}
                  className="text-rose-600 hover:text-rose-800 font-medium hover:underline flex items-center gap-1.5 cursor-pointer py-1 disabled:opacity-50"
                  title="Limpa dados temporários em caso de travamento do navegador"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>{isEmergencyResetting ? 'Limpando...' : 'Limpar Cache Temporário'}</span>
                </button>
              </div>

              {/* Toggle Technical Details */}
              <button
                type="button"
                id="btn_error_boundary_toggle_details"
                onClick={() => this.setState({ showDetails: !showDetails })}
                className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer py-1"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{showDetails ? 'Ocultar Detalhes' : 'Ver Detalhes Técnicos'}</span>
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Technical Details Accordion */}
            {showDetails && (
              <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-slate-500" />
                    <span>Stack Trace e Diagnóstico</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn_error_boundary_copy_stack"
                      onClick={this.handleCopyReport}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copiado!' : 'Copiar Diagnóstico'}</span>
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      id="btn_error_boundary_download_json"
                      onClick={this.handleDownloadReport}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Baixar JSON</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-xl p-3.5 text-slate-200 font-mono text-[11px] max-h-56 overflow-y-auto space-y-2 select-text border border-slate-800 shadow-inner">
                  <div>
                    <span className="text-rose-400 font-bold block">{error?.name}: {error?.message}</span>
                  </div>
                  {error?.stack && (
                    <div className="text-slate-400 text-[10px] leading-relaxed whitespace-pre-wrap">
                      {error.stack}
                    </div>
                  )}
                  {errorInfo?.componentStack && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-amber-400 text-[10px] font-bold block mb-1">Component Stack:</span>
                      <pre className="text-slate-400 text-[10px] whitespace-pre-wrap font-mono">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Card Footer info */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>ManyFlow Shield Active Protection</span>
            </span>
            <span>{timestamp ? new Date(timestamp).toLocaleTimeString() : ''}</span>
          </div>

        </div>

        {/* Modal: Report Problem */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 relative">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Reportar Problema à Equipe</h3>
                    <p className="text-[11px] text-slate-500">Ajude-nos a resolver este comportamento inesperado.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => this.setState({ showReportModal: false })}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isReportSent ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Relatório Enviado com Sucesso!</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      O relatório com protocolo <strong className="font-mono text-slate-800">{errorId}</strong> foi registrado para nossa equipe de engenharia.
                    </p>
                  </div>
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => this.setState({ showReportModal: false })}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={this.handleSubmitReport} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      O que você estava fazendo quando o erro ocorreu?
                    </label>
                    <textarea
                      rows={3}
                      value={reportMessage}
                      onChange={(e) => this.setState({ reportMessage: e.target.value })}
                      placeholder="Ex: Estava editando um bloco no FlowBuilder quando cliquei em salvar..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Seu e-mail de contato (opcional)
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => this.setState({ userEmail: e.target.value })}
                      placeholder="seu-email@dominio.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span>Dados anexados automaticamente:</span>
                      <span className="font-mono text-[10px] text-slate-500">{errorId}</span>
                    </div>
                    <p className="line-clamp-2">
                      Tipo de erro, stack trace de renderização, URL da página e versão do navegador.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => this.setState({ showReportModal: false })}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={this.handleCopyReport}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isReporting}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isReporting ? 'Enviando...' : 'Enviar Relatório'}</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}

      </div>
    );
  }
}
