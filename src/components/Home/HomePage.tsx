import React, { useState } from 'react';
import {
  Bot,
  Zap,
  ShieldCheck,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Instagram,
  Facebook,
  MessageCircle,
  Send,
  Users,
  Radio,
  BarChart3,
  Globe,
  KeyRound,
  ShieldAlert,
  Server,
  Layers,
  Check,
  ChevronRight,
  HelpCircle,
  Play,
  Flame,
  Clock,
  Eye,
  Building2,
  Sun,
  Moon,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface HomePageProps {
  onGoToApp?: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenDemo?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onGoToApp,
  onOpenLogin,
  onOpenRegister,
  onOpenDemo
}) => {
  const { user, tenant, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Interactive Live Demo state in Hero
  const [demoInput, setDemoInput] = useState('');
  const [demoMessages, setDemoMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Olá! 👋 Bem-vindo ao ManyFlow. Digite "PREÇOS", "CUPOM" ou "VIP" para ver a automação instantânea!',
      time: 'Agora'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Active FAQ state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const brandName = tenant?.branding?.brandName || 'ManyFlow';
  const primaryColor = tenant?.branding?.primaryColor || '#0084FF';

  const handleSendDemoMessage = (textToSend?: string) => {
    const query = (textToSend || demoInput).trim();
    if (!query) return;

    const newMsg = { sender: 'user' as const, text: query, time: 'Agora' };
    setDemoMessages((prev) => [...prev, newMsg]);
    setDemoInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = '';
      const upper = query.toUpperCase();

      if (upper.includes('PREÇO') || upper.includes('PLANOS') || upper.includes('VALOR')) {
        botResponse = '🚀 Nossos planos iniciam em R$ 97/mês com automações ilimitadas para Instagram e WhatsApp! Deseja agendar uma demonstração?';
      } else if (upper.includes('CUPOM') || upper.includes('DESCONTO') || upper.includes('EU QUERO')) {
        botResponse = '🎉 Parabéns! Liberamos o cupom MASTER20 com 20% de desconto no primeiro ano da sua assinatura!';
      } else if (upper.includes('VIP') || upper.includes('GRUPO') || upper.includes('WHATSAPP')) {
        botResponse = '💎 Nosso sistema gerencia grupos VIPs de WhatsApp no piloto automático: recebe PIX, adiciona o membro e expulsa quem não renovou!';
      } else if (upper.includes('SEGURANÇA') || upper.includes('MASTER') || upper.includes('DADOS')) {
        botResponse = '🔒 100% Seguro! Todos os workspaces são isolados em containers com autenticação criptografada e controle via Senha Master.';
      } else {
        botResponse = `🤖 Olá! Recebi sua mensagem: "${query}". Nossa IA Gemini 3.7 integrada pode qualificar leads e fechar vendas 24 horas por dia!`;
      }

      setDemoMessages((prev) => [
        ...prev,
        { sender: 'bot', text: botResponse, time: 'Agora' }
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div id="public_home_page" className="min-h-screen bg-[#F8F9FB] dark:bg-slate-950 text-[#1A1D21] dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] transition-colors">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-600 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2">
        <span className="bg-blue-900/60 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/20">
          Novidade 2026
        </span>
        <span>Meta Graph API v21.0 + Google Gemini 3.7 + Administrador VIP de Grupos WhatsApp</span>
        <button
          onClick={onOpenRegister}
          className="ml-2 underline font-bold hover:text-blue-100 cursor-pointer hidden sm:inline"
        >
          Criar Conta Grátis →
        </button>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-[#E2E8F0] dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#1A1D21] dark:text-white">
                  {brandName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Meta Online
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 hidden sm:block">
                Automação Oficial Instagram, WhatsApp & Messenger
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#64748B] dark:text-slate-300">
            <a href="#recursos" className="hover:text-[#0084FF] dark:hover:text-blue-400 transition-colors">
              Recursos
            </a>
            <a href="#whatsapp-vip" className="hover:text-[#0084FF] dark:hover:text-blue-400 transition-colors">
              Grupos WhatsApp
            </a>
            <a href="#seguranca" className="hover:text-[#0084FF] dark:hover:text-blue-400 transition-colors">
              Segurança & Isolamento
            </a>
            <a href="#precos" className="hover:text-[#0084FF] dark:hover:text-blue-400 transition-colors">
              Planos
            </a>
            <a href="#faq" className="hover:text-[#0084FF] dark:hover:text-blue-400 transition-colors">
              Dúvidas
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Alternar Tema"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth Buttons */}
            {isAuthenticated && user ? (
              <button
                id="btn_home_to_app"
                onClick={onGoToApp}
                className="py-2 px-4 rounded-xl bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Acessar Meu Painel ({user.name.split(' ')[0]})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  id="btn_home_login"
                  onClick={onOpenLogin}
                  className="py-2 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  Entrar
                </button>
                <button
                  id="btn_home_cta_nav"
                  onClick={onOpenRegister}
                  className="py-2 px-4 rounded-xl bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Começar Grátis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-18 lg:pb-28">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/10 dark:bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Automação Conversacional com IA Gemini 3.7 & Meta Cloud API</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1A1D21] dark:text-white leading-[1.15]">
                Automatize seu Instagram,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0084FF] via-indigo-600 to-pink-600">
                  WhatsApp & Messenger
                </span>{' '}
                sem perder o controle.
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Transforme comentários em vendas no Direct, gerencie e monetize grupos VIP no WhatsApp, e qualifique leads 24/7 em uma infraestrutura multi-tenant com <strong>Isolamento Total</strong> e <strong>Segurança com Senha Master</strong>.
              </p>

              {/* CTAs - Only authenticated users can enter the workspace */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                {isAuthenticated && user ? (
                  <button
                    id="btn_hero_open_app_direct"
                    onClick={onGoToApp}
                    className="w-full sm:w-auto py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Entrar no Sistema ({user.name.split(' ')[0]})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button
                      id="btn_hero_start_free"
                      onClick={onOpenRegister}
                      className="w-full sm:w-auto py-3 px-6 rounded-xl bg-[#0084FF] hover:bg-[#0073E6] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Criar Conta e Entrar</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      id="btn_hero_open_login"
                      onClick={onOpenLogin}
                      className="w-full sm:w-auto py-3 px-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-[#1A1D21] dark:text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-blue-600" />
                      <span>Fazer Login para Acessar</span>
                    </button>
                  </>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#64748B] dark:text-slate-400 font-semibold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Isolamento Total de Workspaces</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  <span>Meta Graph API v21.0 Homologada</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span>Proteção por Senha Master</span>
                </div>
              </div>
            </div>

            {/* Right Live Interactive Demo Widget */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 relative">
                {/* Header Mockup */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white">
                        <Bot className="w-5 h-5" />
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1D21] dark:text-white flex items-center gap-1">
                        <span>Assistente ManyFlow</span>
                        <CheckCircle2 className="w-3 h-3 text-blue-500" />
                      </h4>
                      <p className="text-[10px] text-[#64748B] dark:text-slate-400 font-mono">
                        Instagram DM & WhatsApp Online
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Demonstração Ao Vivo
                  </span>
                </div>

                {/* Messages Box */}
                <div className="h-64 overflow-y-auto py-3 space-y-2.5 pr-1 text-xs">
                  {demoMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                          msg.sender === 'user'
                            ? 'bg-[#0084FF] text-white rounded-br-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-[#1A1D21] dark:text-slate-100 rounded-bl-xs border border-slate-200/50 dark:border-slate-700/50'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <span
                          className={`text-[9px] block text-right mt-1 ${
                            msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-3 py-2 text-slate-500 text-[11px] flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                        <span className="text-[10px] font-semibold text-slate-400 ml-1">ManyFlow digitando...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Keyword Buttons */}
                <div className="pt-2 pb-2 flex flex-wrap gap-1.5 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-[#64748B] font-semibold self-center mr-1">
                    Gatilhos:
                  </span>
                  <button
                    onClick={() => handleSendDemoMessage('EU QUERO CUPOM')}
                    className="text-[10px] font-bold px-2 py-1 rounded bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 hover:bg-pink-100 cursor-pointer transition-colors"
                  >
                    🎉 EU QUERO CUPOM
                  </button>
                  <button
                    onClick={() => handleSendDemoMessage('PREÇOS')}
                    className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 cursor-pointer transition-colors"
                  >
                    💰 PREÇOS
                  </button>
                  <button
                    onClick={() => handleSendDemoMessage('WHATSAPP VIP')}
                    className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer transition-colors"
                  >
                    💎 WHATSAPP VIP
                  </button>
                </div>

                {/* Input form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendDemoMessage();
                  }}
                  className="flex items-center gap-2 pt-2"
                >
                  <input
                    type="text"
                    value={demoInput}
                    onChange={(e) => setDemoInput(e.target.value)}
                    placeholder="Digite uma mensagem para testar..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-[#1A1D21] dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0084FF]"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-[#0084FF] text-white hover:bg-[#0073E6] cursor-pointer transition-colors shadow-2xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Counter Bar */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0084FF]">99.98%</div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 font-semibold mt-1">
                Uptime Garantido & Alta Disponibilidade
              </p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">+4.8M</div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 font-semibold mt-1">
                Mensagens & DMs Processadas
              </p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">&lt; 38ms</div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 font-semibold mt-1">
                Latência de Resposta aos Webhooks
              </p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">100%</div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 font-semibold mt-1">
                Isolamento Multi-Tenant & Proteção LGPD
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="recursos" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0084FF] bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            Tudo o que sua Operação Precisa
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1A1D21] dark:text-white">
            Poder de Automação Enterprise, Simplicidade no Uso
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
            Projetado para agências, criadores, afiliados e grandes empresas escalarem conversões no Instagram e WhatsApp com segurança absoluta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Comment to DM */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center font-bold">
              <Instagram className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1A1D21] dark:text-white">
              Comentário ➔ Direct (Reels & Feed)
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              Responda instantaneamente comentários específicos nos seus Reels com links de checkout ou cupons no Direct, curtindo o comentário automaticamente para aumentar o alcance.
            </p>
          </div>

          {/* Card 2: WhatsApp VIP Groups */}
          <div id="whatsapp-vip" className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1A1D21] dark:text-white">
              Grupos WhatsApp VIP & Monetização
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              Motor híbrido (Cloud API + Baileys): anti-link de concorrentes, rotador de links de entrada, expulsão de inadimplentes e gestão de assinaturas recorrentes via PIX.
            </p>
          </div>

          {/* Card 3: Visual Flow Builder & Gemini AI */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#0084FF] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1A1D21] dark:text-white">
              Editor Visual de Fluxos & IA Gemini
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              Crie árvores de decisão visuais com nós de condição, botões interativos, transição para atendente humano e prompts generativos de IA com Google Gemini 3.7.
            </p>
          </div>

          {/* Card 4: CRM & Lead Scoring */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1A1D21] dark:text-white">
              Audiência & Lead Scoring Dinâmico
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              Pontuação em tempo real de contatos com base em cliques, respostas e engajamento. Ações em lote, tags inteligentes e histórico completo de auditoria de conversas.
            </p>
          </div>

          {/* Card 5: Broadcast Campaigns */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1A1D21] dark:text-white">
              Campanhas de Transmissão (Broadcast)
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              Dispare campanhas em massa com respeito às regras de janela de 24 horas da Meta e templates oficiais aprovados para reengajar sua audiência com segurança.
            </p>
          </div>

          {/* Card 6: Multi-Domain & White-Label */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1A1D21] dark:text-white">
              Multi-Domínios em Servidor Único
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              Configure domínios customizados para seus clientes com SSL automático, logo e cores personalizadas apontando para uma única instalação no seu aaPanel.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Anti-Intrusion Section (User Request Focus) */}
      <section id="seguranca" className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Arquitetura Blindada Anti-Vazamento</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Como garantimos a segurança máxima dos seus dados e clientes
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Nenhum usuário de um workspace consegue enxergar ou consultar fluxos, contatos ou mensagens de outro workspace. Todo o tráfego é autenticado por tokens criptografados e chaves com isolamento rigoroso.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Criptografia de Ponta a Ponta & Tokens Seguros</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tokens de longa duração da Graph API e credenciais são armazenados de forma criptografada no banco de dados.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                  <Building2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Isolamento Físico de Workspaces (Multi-Tenant)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Consultas ao banco de dados são escopadas estritamente por workspace. Ninguém tem acesso aos contatos ou credenciais alheias.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                  <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Validação de Assinatura Webhook (HMAC SHA-256)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Todo payload recebido da Meta é verificado criptograficamente antes de ser processado pelo motor de automação.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="lg:col-span-6">
              <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[11px] text-slate-400 font-bold ml-2">manyflow_security_guard.sh</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    PROTEÇÃO ATIVA
                  </span>
                </div>

                <div className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                  <p className="text-emerald-400">✓ Meta Webhook Signature HMAC SHA-256: VERIFIED</p>
                  <p className="text-blue-400">✓ Tenant Scoping: Strict Validation per Session</p>
                  <p className="text-emerald-400">✓ Token Authorization: JWT Bearer Scoped per Workspace</p>
                  <p className="text-indigo-400">✓ Database: MongoDB Pool Active with Composite Indexes</p>
                  <p className="text-slate-400 pt-2 border-t border-slate-700">
                    [Status] Nenhuma violação detectada. Todas as requisições autenticadas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Plans */}
      <section id="precos" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            Planos Acessíveis & Transparentes
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1A1D21] dark:text-white">
            Escolha o Plano Ideal para seu Negócio
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
            Sem contratos longos. Cancele ou faça upgrade a qualquer momento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1: Starter */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
            <div>
              <span className="text-xs font-bold text-[#64748B] uppercase">Iniciante</span>
              <h3 className="text-xl font-bold text-[#1A1D21] dark:text-white mt-1">Starter</h3>
              <div className="mt-3">
                <span className="text-3xl font-black text-[#1A1D21] dark:text-white">R$ 97</span>
                <span className="text-xs text-[#64748B]"> /mês</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-[#64748B] dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>1 Perfil de Instagram + 1 Página Messenger</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Automação de Comentários no Reels</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Até 5.000 contatos no CRM</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Suporte por Email & Base de Conhecimento</span>
              </li>
            </ul>

            <button
              onClick={onOpenRegister}
              className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Começar com Starter
            </button>
          </div>

          {/* Plan 2: Pro (Featured) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-[#0084FF] shadow-xl space-y-5 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0084FF] text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-xs">
              Mais Popular
            </span>
            <div>
              <span className="text-xs font-bold text-[#0084FF] uppercase">Escalabilidade</span>
              <h3 className="text-xl font-bold text-[#1A1D21] dark:text-white mt-1">Profissional & VIP</h3>
              <div className="mt-3">
                <span className="text-3xl font-black text-[#0084FF]">R$ 197</span>
                <span className="text-xs text-[#64748B]"> /mês</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-[#64748B] dark:text-slate-300">
              <li className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                <Check className="w-4 h-4 text-[#0084FF] shrink-0" />
                <span>Tudo do Plano Starter +</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#0084FF] shrink-0" />
                <span>Administrador de Grupos VIP WhatsApp</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#0084FF] shrink-0" />
                <span>Integração IA Google Gemini 3.7</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#0084FF] shrink-0" />
                <span>Até 50.000 contatos e Lead Scoring</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#0084FF] shrink-0" />
                <span>Transmissão em Massa (Broadcast)</span>
              </li>
            </ul>

            <button
              onClick={onOpenRegister}
              className="w-full py-2.5 rounded-xl bg-[#0084FF] hover:bg-[#0073E6] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Assinar Plano Pro
            </button>
          </div>

          {/* Plan 3: White-Label Agency */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase">Agências & White-Label</span>
              <h3 className="text-xl font-bold text-[#1A1D21] dark:text-white mt-1">Enterprise & Agência</h3>
              <div className="mt-3">
                <span className="text-3xl font-black text-[#1A1D21] dark:text-white">R$ 497</span>
                <span className="text-xs text-[#64748B]"> /mês</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-[#64748B] dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Domínios Ilimitados (Multi-Domínio White-Label)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Múltiplos Facebook Developer Apps (Multi-Contas)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Painel de Segurança com Senha Master Root</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Contatos Ilimitados no MongoDB</span>
              </li>
            </ul>

            <button
              onClick={onOpenRegister}
              className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Falar com Consultor Agência
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl font-black text-[#1A1D21] dark:text-white">
            Perguntas Frequentes sobre Segurança & Acesso
          </h2>
          <p className="text-xs text-[#64748B] dark:text-slate-400">
            Tudo o que você precisa saber sobre o método seguro de autenticação e proteção dos seus dados.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Como funciona o método de autenticação seguro para impedir que estranhos entrem?',
              a: 'Nosso sistema utiliza criptografia ponta a ponta com tokens de sessão assinados (Bearer Token) e isolamento rigoroso por Workspace (Tenant). Nenhum usuário consegue acessar registros, contatos ou fluxos de outros clientes.'
            },
            {
              q: 'O que é a Senha Master e quem pode configurá-la?',
              a: 'A Senha Master é uma chave raiz exclusiva configurada exclusivamente pelo Administrador Master (Super Admin). Ela garante acesso emergencial e autoriza ações críticas, como o modo Lockdown do sistema.'
            },
            {
              q: 'Posso usar meu próprio domínio (White-Label) no meu servidor aaPanel?',
              a: 'Sim! A plataforma foi construída em Node.js com escuta em 0.0.0.0:3000 pronta para Nginx Reverse Proxy no aaPanel, permitindo mapear dezenas de domínios personalizados para empresas diferentes.'
            },
            {
              q: 'O que acontece se eu ativar o Modo Lockdown?',
              a: 'Ao ativar o Modo Lockdown via painel Master, todas as sessões de usuários não-administradores são imediatamente bloqueadas, impedindo qualquer acesso externo até que você decida desativá-lo.'
            }
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs text-[#1A1D21] dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                    activeFaq === index ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {activeFaq === index && (
                <div className="p-4 pt-0 text-xs text-[#64748B] dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/60 leading-relaxed bg-slate-50/50 dark:bg-slate-900/50">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-10 text-xs text-[#64748B] dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: primaryColor }}
            >
              {brandName.slice(0, 1).toUpperCase()}
            </div>
            <span className="font-bold text-[#1A1D21] dark:text-white">{brandName}</span>
            <span>© 2026. Todos os direitos reservados.</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button onClick={onOpenLogin} className="hover:text-blue-600 transition-colors cursor-pointer">
              Login de Clientes
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-emerald-600 font-mono text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              API v21.0 Ativa
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
