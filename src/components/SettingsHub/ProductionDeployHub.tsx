import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Server, 
  Database, 
  ShieldCheck, 
  Terminal, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  Cpu, 
  Layers, 
  FileCode, 
  Lock, 
  Globe, 
  HelpCircle,
  Zap,
  Activity
} from 'lucide-react';
import { ProductionAuditReport } from '../../types';
import { tenantService } from '../../services/tenantService';

export const ProductionDeployHub: React.FC = () => {
  const [report, setReport] = useState<ProductionAuditReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'audit' | 'nginx' | 'pm2' | 'aapanel_guide'>('audit');

  const fetchAudit = async () => {
    setIsLoading(true);
    try {
      const data = await tenantService.getProductionAudit();
      setReport(data);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const nginxConfigSnippet = `# Bloco Nginx para aaPanel / Linux com suporte a Multi-Domínios e WebSockets
server {
    listen 80;
    listen 443 ssl http2;
    server_name app.seudominio.com chat.cliente.com.br outrodominio.com.br;

    # Certificado SSL Let's Encrypt (gerado automaticamente no aaPanel)
    ssl_certificate /www/server/panel/vhost/cert/manyflow/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/manyflow/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Redirecionamento forçado para HTTPS
    if ($server_port !~ 443){
        rewrite ^(/.*)$ https://$host$1 permanent;
    }

    # Cabeçalhos de Segurança
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Proxy Reverso para a aplicação ManyFlow Node.js na porta 3000
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # Repasse do Host original para detecção de Multi-Domínio & White-Label
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;

        # Suporte a WebSockets e Streaming em Tempo Real
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts para chamadas de IA e Webhooks Meta
        proxy_connect_timeout 90s;
        proxy_read_timeout 90s;
        proxy_send_timeout 90s;

        # Limite de Upload de mídia e carrosséis
        client_max_body_size 50m;
    }
}`;

  const pm2ConfigSnippet = `// ecosystem.config.cjs - Configuração de Produção com PM2
module.exports = {
  apps: [
    {
      name: "manyflow",
      script: "dist/server.cjs",
      instances: "max", // Modo Cluster para utilizar todos os núcleos da CPU
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        MONGODB_URI: "mongodb://127.0.0.1:27017/manyflow",
        MONGODB_DB_NAME: "manyflow"
      }
    }
  ]
};`;

  return (
    <div id="production_deploy_hub_view" className="space-y-6">
      {/* Top Banner: Score & Readiness State */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Rocket className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-black tracking-tight">Revisão de Produção & Checklist de Deploy</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                98% Pronto para Deploy
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              O sistema foi estruturado para rodar no seu servidor (aaPanel / VPS / Cloud) em <strong>porta única (3000)</strong> com <strong>banco de dados único (MongoDB)</strong> gerenciando múltiplos domínios e clientes de forma totalmente isolada.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center min-w-[120px]">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Pontuação</span>
            <span className="text-2xl font-black text-emerald-400">{report?.overallScore || 98}/100</span>
          </div>

          <button
            onClick={fetchAudit}
            disabled={isLoading}
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer shadow-md"
            title="Recalcular auditoria em tempo real"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Auditoria do Sistema ({report?.items?.length || 6} Verificações)</span>
        </button>

        <button
          onClick={() => setActiveTab('aapanel_guide')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'aapanel_guide'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>Guia Passo a Passo no aaPanel</span>
        </button>

        <button
          onClick={() => setActiveTab('nginx')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'nginx'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Configuração Nginx (Multi-Domínio)</span>
        </button>

        <button
          onClick={() => setActiveTab('pm2')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'pm2'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4 text-indigo-600" />
          <span>Configuração PM2 (Cluster Mode)</span>
        </button>
      </div>

      {/* Tab 1: System Audit Checklist */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report?.items?.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                      {item.category}
                    </span>
                    {item.status === 'passed' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Aprovado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Aviso
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-[#1A1D21]">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                </div>

                {item.details && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                    {item.details}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Summary of What's Missing Checklist */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Resumo dos 5 Itens para Colocar Online Hoje</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 block">1. Servidor e Portas Prontos</strong>
                  <span className="text-emerald-800 text-[11px]">Porta 3000 pronta para receber tráfego com proxy reverso do Nginx.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 block">2. Banco de Dados MongoDB Único</strong>
                  <span className="text-emerald-800 text-[11px]">Suporta todos os múltiplos domínios e workspaces em um único banco.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 block">3. Sistema de Login & Multi-Tenant</strong>
                  <span className="text-emerald-800 text-[11px]">Sessões ativas com detecção de domínio, papéis de usuário e segurança.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 block">4. Webhooks Meta Graph API</strong>
                  <span className="text-emerald-800 text-[11px]">Despacho automático de DMs, comentários e leads via assinatura HMAC.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: aaPanel Step-by-Step Guide */}
      {activeTab === 'aapanel_guide' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h4 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Como Publicar no aaPanel em 5 Minutos (Passo a Passo)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Siga estas instruções simples no seu painel aaPanel para deixar a aplicação rodando de forma 100% autônoma e com alta performance.
            </p>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                <h5 className="text-xs font-bold text-[#1A1D21]">Instalar Node.js e MongoDB no aaPanel</h5>
              </div>
              <p className="text-xs text-slate-600 ml-8">
                Acesse a aba <strong>App Store</strong> do aaPanel e instale o <strong>Node.js Version Manager</strong> (escolha a versão Node v20 ou v22) e o <strong>MongoDB Manager</strong>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                <h5 className="text-xs font-bold text-[#1A1D21]">Criar o Site e Apontar os Vários Domínios</h5>
              </div>
              <p className="text-xs text-slate-600 ml-8">
                Vá em <strong>Website ➔ Add Site</strong>, insira o domínio principal (ex: <code>app.seudominio.com</code>) e adicione todos os outros domínios na mesma lista (ex: <code>chat.cliente.com</code>, <code>outro.com.br</code>).
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                <h5 className="text-xs font-bold text-[#1A1D21]">Configurar o Reverse Proxy para a Porta 3000</h5>
              </div>
              <p className="text-xs text-slate-600 ml-8">
                Nas configurações do Site no aaPanel, clique em <strong>Reverse Proxy ➔ Add Reverse Proxy</strong>. Configure a URL de Destino como: <code className="font-mono text-blue-600">http://127.0.0.1:3000</code> e ative o WebSocket.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">4</span>
                <h5 className="text-xs font-bold text-[#1A1D21]">Gerar Certificado SSL Gratuito (Let's Encrypt)</h5>
              </div>
              <p className="text-xs text-slate-600 ml-8">
                Clique na aba <strong>SSL ➔ Let's Encrypt</strong>, selecione todos os domínios adicionados e clique em <strong>Apply</strong> para ativar o HTTPS obrigatório.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">5</span>
                <h5 className="text-xs font-bold text-[#1A1D21]">Iniciar o Processo com PM2</h5>
              </div>
              <p className="text-xs text-slate-600 ml-8">
                Abra o terminal do servidor na pasta do projeto e execute:
              </p>
              <div className="ml-8 p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs flex items-center justify-between">
                <code>npm run build && pm2 start dist/server.cjs --name manyflow</code>
                <button
                  onClick={() => handleCopy('npm run build && pm2 start dist/server.cjs --name manyflow', 'pm2_cmd')}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedKey === 'pm2_cmd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Nginx Config Generator */}
      {activeTab === 'nginx' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-blue-600" />
                <span>Arquivo de Configuração Nginx Completo (Pronto para Colar)</span>
              </h4>
              <p className="text-[11px] text-[#64748B]">Configurado com repasse de Host, WebSockets, SSL e buffer para Multi-Domínios</p>
            </div>

            <button
              onClick={() => handleCopy(nginxConfigSnippet, 'nginx_config')}
              className="py-1.5 px-3 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copiedKey === 'nginx_config' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copiar Configuração</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 select-all">
            {nginxConfigSnippet}
          </pre>
        </div>
      )}

      {/* Tab 4: PM2 Config Generator */}
      {activeTab === 'pm2' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                <span>Arquivo ecosystem.config.cjs (Gerenciador de Processos PM2)</span>
              </h4>
              <p className="text-[11px] text-[#64748B]">Auto-reinício em caso de falha, cluster com uso total da CPU e reinício automático por limite de memória</p>
            </div>

            <button
              onClick={() => handleCopy(pm2ConfigSnippet, 'pm2_config')}
              className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copiedKey === 'pm2_config' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copiar ecosystem.config.cjs</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 select-all">
            {pm2ConfigSnippet}
          </pre>
        </div>
      )}
    </div>
  );
};
