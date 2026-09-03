import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Server, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Copy, 
  Check, 
  Terminal, 
  Cpu, 
  ArrowRight, 
  ExternalLink, 
  Activity,
  Layers,
  Lock,
  Code2,
  FileCode,
  Zap,
  Radio,
  CheckCheck
} from 'lucide-react';
import { DnsValidationReport } from '../../types';
import { plansAndAffiliatesService } from '../../services/plansAndAffiliatesService';

interface TechnicalDnsUtilityProps {
  initialDomain?: string;
  onDomainValidated?: (domain: string) => void;
}

export const TechnicalDnsUtility: React.FC<TechnicalDnsUtilityProps> = ({ 
  initialDomain = 'app.suaagencia.com.br',
  onDomainValidated 
}) => {
  const [domainInput, setDomainInput] = useState(initialDomain);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<DnsValidationReport | null>(null);
  const [copiedTarget, setCopiedTarget] = useState(false);
  const [copiedNginx, setCopiedNginx] = useState(false);
  const [copiedCaddy, setCopiedCaddy] = useState(false);
  const [activeTab, setActiveTab] = useState<'validator' | 'nginx' | 'cloudflare_guide' | 'ssl_certbot'>('validator');

  const handleTestDns = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!domainInput.trim()) return;

    setIsLoading(true);
    try {
      const res = await plansAndAffiliatesService.validateDns(domainInput);
      setReport(res);
      if (res.cnameRecordVerified && onDomainValidated) {
        onDomainValidated(res.domain);
      }
    } catch (err) {
      console.error('Erro ao validar DNS:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleTestDns();
  }, []);

  const handleCopy = (text: string, type: 'target' | 'nginx' | 'caddy') => {
    navigator.clipboard.writeText(text);
    if (type === 'target') {
      setCopiedTarget(true);
      setTimeout(() => setCopiedTarget(false), 2000);
    } else if (type === 'nginx') {
      setCopiedNginx(true);
      setTimeout(() => setCopiedNginx(false), 2000);
    } else if (type === 'caddy') {
      setCopiedCaddy(true);
      setTimeout(() => setCopiedCaddy(false), 2000);
    }
  };

  return (
    <div id="technical-dns-utility-root" className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>MODO TÉCNICO • UTILITÁRIO DNS & CNAME</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              Configurador de Domínio Personalizado & Validador de DNS
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Aponte o subdomínio da sua agência ou cliente via registro CNAME para operar o ManyFlow 100% White-Label na porta 3000 com SSL automático.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Alvo CNAME Canônico</span>
              <span className="font-mono text-xs font-bold text-emerald-400">cname.manyflow.io</span>
            </div>
            <button
              onClick={() => handleCopy('cname.manyflow.io', 'target')}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Copiar host CNAME"
            >
              {copiedTarget ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedTarget ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('validator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'validator'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Diagnóstico de DNS em Tempo Real</span>
        </button>

        <button
          onClick={() => setActiveTab('nginx')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'nginx'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Configuração Nginx (Reverse Proxy 3000)</span>
        </button>

        <button
          onClick={() => setActiveTab('cloudflare_guide')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'cloudflare_guide'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Guia Cloudflare & aaPanel</span>
        </button>

        <button
          onClick={() => setActiveTab('ssl_certbot')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'ssl_certbot'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Certificado SSL Let's Encrypt</span>
        </button>
      </div>

      {/* Tab Content: Real-time Validator */}
      {activeTab === 'validator' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Domain Query Input Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              Digite o Domínio ou Subdomínio para Testar a Resolução:
            </label>
            <form onSubmit={handleTestDns} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="Ex: app.suaempresa.com.br ou chat.cliente.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono text-slate-800 outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Consultando Root Servers...</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4" />
                    <span>Verificar Apontamento DNS</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
              <span className="font-semibold text-slate-700">Entrada recomendada no seu DNS:</span>
              <code className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-bold">
                CNAME {domainInput.split('.')[0] || 'app'} ➔ cname.manyflow.io
              </code>
            </div>
          </div>

          {/* Results Overview Grid */}
          {report && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
                <div className={`p-3 rounded-xl ${report.cnameRecordVerified ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                  {report.cnameRecordVerified ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Registro CNAME</span>
                  <span className={`text-xs font-bold ${report.cnameRecordVerified ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {report.cnameRecordVerified ? 'Propagado e Ativo' : 'Não Encontrado'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">➔ {report.expectedCname}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
                <div className={`p-3 rounded-xl ${report.sslCertificateActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Certificado SSL</span>
                  <span className="text-xs font-bold text-slate-800">
                    {report.sslCertificateActive ? 'HTTPS Ativo (TLS 1.3)' : 'Pendente / Auto'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Let's Encrypt / Cloudflare</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Porta de Ingress</span>
                  <span className="text-xs font-bold text-slate-800">Porta 3000 (0.0.0.0)</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">Pronto para Reverse Proxy</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Multi-Tenant Routing</span>
                  <span className="text-xs font-bold text-slate-800">Host Header Auto</span>
                  <span className="text-[10px] text-slate-500 block">Isolamento White-Label</span>
                </div>
              </div>
            </div>
          )}

          {/* Global Node Propagation Table */}
          {report && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-900">
                    Checagem de Propagação Global de DNS ({report.domain})
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500">
                  Testado em: {new Date(report.testedAt).toLocaleTimeString('pt-BR')}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {report.nodesChecked.map((node, i) => (
                  <div key={i} className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700 font-mono">
                        {node.countryCode}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{node.location}</span>
                        <span className="text-[10px] text-slate-400 font-mono">DNS: {node.dnsServer}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-xs font-mono font-semibold text-slate-700 block">
                          {node.resolvedIpOrCname}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">TTL: {node.ttlSeconds}s</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-500">{node.latencyMs}ms</span>
                        <span className={`p-1.5 rounded-full ${node.status === 'passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Nginx Configuration */}
      {activeTab === 'nginx' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-600" />
                  Bloco de Configuração Nginx (VirtualHost / Reverse Proxy)
                </h3>
                <p className="text-xs text-slate-500">
                  Copie e cole este bloco no seu arquivo de configuração do Nginx ou no painel do aaPanel.
                </p>
              </div>

              <button
                onClick={() => handleCopy(report?.nginxSnippet || '', 'nginx')}
                className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                {copiedNginx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNginx ? 'Código Copiado!' : 'Copiar Configuração'}</span>
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0F172A] p-4 font-mono text-xs text-slate-200">
              <pre className="overflow-x-auto whitespace-pre leading-relaxed text-blue-200">
                {report?.nginxSnippet || `server {
    listen 80;
    listen 443 ssl http2;
    server_name ${domainInput};

    ssl_certificate /etc/letsencrypt/live/${domainInput}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domainInput}/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`}
              </pre>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-blue-800">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Parâmetros Críticos Incluídos:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                <li><strong>proxy_set_header Host $host;</strong> ➔ Permite que o ManyFlow identifique o workspace/tenant correto automaticamente via White-Label.</li>
                <li><strong>Upgrade $http_upgrade & Connection 'upgrade';</strong> ➔ Mantém a conexão do Live Chat e WebSockets ativa em tempo real.</li>
                <li><strong>proxy_pass http://127.0.0.1:3000;</strong> ➔ Redireciona para a porta local padrão sem necessidade de abrir portas extras no firewall.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Cloudflare & aaPanel Guide */}
      {activeTab === 'cloudflare_guide' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Instruções de Apontamento no Cloudflare & aaPanel
            </h3>
            <p className="text-xs text-slate-500">
              Siga este roteiro simples para configurar o subdomínio da sua agência ou do seu cliente em menos de 2 minutos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1: Cloudflare */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Configuração de DNS no Cloudflare</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                <li>• Adicione um registro <strong>Tipo: CNAME</strong></li>
                <li>• <strong>Nome (Host):</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">app</code> (ou o subdomínio desejado)</li>
                <li>• <strong>Alvo (Target):</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">cname.manyflow.io</code></li>
                <li>• <strong>Status do Proxy:</strong> Inicialmente configure como <em>DNS Only (Nuvem Cinza)</em> para emitir o certificado Let's Encrypt. Após emitido, você pode ativar o proxy (Nuvem Laranja) com SSL Full/Strict.</li>
              </ul>
            </div>

            {/* Step 2: aaPanel */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Configuração no aaPanel</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                <li>• Acesse <strong>Website ➔ Adicionar Site</strong> e informe o domínio (ex: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold">{domainInput}</code>).</li>
                <li>• Clique em <strong>Configurações do Site ➔ Reverse Proxy</strong>.</li>
                <li>• Crie um novo proxy apontando para <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold">http://127.0.0.1:3000</code>.</li>
                <li>• Ative a opção <strong>Enviar Host Original ($host)</strong> e salve.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: SSL Certbot */}
      {activeTab === 'ssl_certbot' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5 animate-in fade-in duration-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              Comando para Emissão de Certificado SSL Gratuito (Certbot)
            </h3>
            <p className="text-xs text-slate-500">
              Caso utilize um servidor VPS próprio com Ubuntu/Debian, execute o comando abaixo no terminal SSH:
            </p>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0F172A] p-4 font-mono text-xs text-emerald-400">
            <code>
              sudo certbot --nginx -d {domainInput} --non-interactive --agree-tos -m admin@{domainInput.split('.').slice(-2).join('.')}
            </code>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs text-slate-700">
              O Certbot configurará automaticamente a renovação a cada 90 dias através do cronjob padrão do sistema.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
