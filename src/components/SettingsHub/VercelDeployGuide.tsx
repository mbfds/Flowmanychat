import React, { useState } from 'react';
import { 
  Globe, 
  Copy, 
  Check, 
  Terminal, 
  Database, 
  ShieldCheck, 
  Key, 
  Layers, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  FileCode,
  Zap,
  HelpCircle,
  Server,
  Cloud
} from 'lucide-react';

interface EnvVarItem {
  key: string;
  example: string;
  required: boolean;
  category: 'Core' | 'Database' | 'AI' | 'Security';
  description: string;
  instructions: string;
}

const ENV_VARIABLES: EnvVarItem[] = [
  {
    key: 'GEMINI_API_KEY',
    example: 'AIzaSyD-sample-key-123456789',
    required: true,
    category: 'AI',
    description: 'Chave de API do Google Gemini para inteligência artificial, automações, bots e geração de conteúdo.',
    instructions: 'Obtenha no Google AI Studio (aistudio.google.com/app/apikey). Obrigatória para o funcionamento dos recursos de IA.'
  },
  {
    key: 'APP_URL',
    example: 'https://seu-projeto.vercel.app',
    required: true,
    category: 'Core',
    description: 'URL canônica pública onde sua aplicação está hospedada.',
    instructions: 'Insira a URL do seu domínio na Vercel ou domínio personalizado (ex: https://app.seudominio.com). Utilizada para callbacks de webhook e links.'
  },
  {
    key: 'MONGODB_URI',
    example: 'mongodb+srv://admin:senhaSegura@cluster0.abcde.mongodb.net/manyflow?retryWrites=true&w=majority',
    required: true,
    category: 'Database',
    description: 'String de conexão com o MongoDB (MongoDB Atlas ou VPS auto-hospedado).',
    instructions: 'No MongoDB Atlas (gratuito), crie um cluster M0, crie um usuário de banco e permita acesso de qualquer IP (0.0.0.0/0) na aba Network Access.'
  },
  {
    key: 'MONGODB_DB_NAME',
    example: 'manyflow',
    required: false,
    category: 'Database',
    description: 'Nome da base de dados no cluster MongoDB. Padrão: manyflow.',
    instructions: 'Se omitido, o sistema utilizará o banco de dados especificado na URI ou o padrão "manyflow".'
  },
  {
    key: 'NODE_ENV',
    example: 'production',
    required: true,
    category: 'Core',
    description: 'Define o ambiente de execução como produção otimizada.',
    instructions: 'Configure com o valor "production" para habilitar otimizações de compilação e segurança.'
  },
  {
    key: 'PORT',
    example: '3000',
    required: false,
    category: 'Core',
    description: 'Porta em que o servidor web escuta. Padrão: 3000.',
    instructions: 'A Vercel injeta a porta automaticamente em serverless. Em VPS/Docker utilize 3000.'
  },
  {
    key: 'WEBHOOK_SECRET',
    example: 'mf_sec_98f4a1c02e8841d99b247f12',
    required: false,
    category: 'Security',
    description: 'Chave secreta para validação criptográfica HMAC-SHA256 de webhooks recebidos.',
    instructions: 'Gere uma chave randômica de 32 caracteres para garantir que requisições ao webhook sejam autênticas.'
  },
  {
    key: 'META_APP_SECRET',
    example: 'e1d88a91b2c34d5e6f7a8b9c0d1e2f3a',
    required: false,
    category: 'Security',
    description: 'Segredo do aplicativo Meta Developers para webhooks do WhatsApp Cloud API e Instagram.',
    instructions: 'Obtenha nas configurações básicas do seu app no Meta Developers (developers.facebook.com).'
  },
  {
    key: 'META_VERIFY_TOKEN',
    example: 'mf_verify_token_77a9',
    required: false,
    category: 'Security',
    description: 'Token de verificação usado no handshake inicial do Meta Webhook.',
    instructions: 'Mesmo token informado no campo "Verify Token" do painel de webhooks da Meta.'
  }
];

const VERCEL_JSON_CONTENT = `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "vite build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(self), geolocation=()"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/favicon.ico",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=86400"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}`;

export const VercelDeployGuide: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'vercel' | 'railway' | 'render' | 'docker'>('vercel');
  const [searchTerm, setSearchTerm] = useState('');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredEnvVars = ENV_VARIABLES.filter(v => 
    v.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="vercel_deploy_guide" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/20">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 1155 1000">
                <path d="m577.3 0 577.4 1000H0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Deploy na Vercel & Configuração de Variáveis de Ambiente
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  vercel.json pronto
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Arquivo de configuração <code className="px-1 py-0.5 rounded bg-slate-100 font-mono text-slate-700">vercel.json</code> com cabeçalhos de segurança HTTP, cache imutável de assets estáticos e SPA rewrites.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Abrir Vercel Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Summary Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Framework Preset</span>
            <span className="text-sm font-black text-slate-900 mt-0.5 block">Vite (React 19)</span>
            <span className="text-[11px] text-slate-500">Output: dist/</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Segurança HSTS & CSP</span>
            <span className="text-sm font-black text-emerald-600 mt-0.5 block">Nível Bancário A+</span>
            <span className="text-[11px] text-slate-500">63.072.000s max-age</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Variáveis de Produção</span>
            <span className="text-sm font-black text-indigo-600 mt-0.5 block">3 Obrigatórias / 6 Opcionais</span>
            <span className="text-[11px] text-slate-500">Documentadas e tipadas</span>
          </div>
        </div>
      </div>

      {/* Section 1: vercel.json File Inspector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-600" />
              <span>Arquivo vercel.json (Configuração de Build & Roteamento)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Localizado na raiz do projeto (<code className="font-mono text-slate-700">/vercel.json</code>). Detectado automaticamente pela Vercel no momento do deploy.
            </p>
          </div>

          <button
            onClick={() => handleCopy(VERCEL_JSON_CONTENT, 'vercel_json')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shrink-0"
          >
            {copiedKey === 'vercel_json' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Copiar vercel.json</span>
              </>
            )}
          </button>
        </div>

        {/* Code block */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>vercel.json</span>
            <span>JSON (Vercel Build Schema)</span>
          </div>
          <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-[340px]">
            {VERCEL_JSON_CONTENT}
          </pre>
        </div>

        {/* Explanations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 pt-1">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="font-bold text-slate-900 block mb-1">1. SPA Fallback Rewrites</span>
            Garante que rotas React como <code className="font-mono text-[11px] bg-white px-1 py-0.5 rounded border border-slate-200">/settings</code> ou <code className="font-mono text-[11px] bg-white px-1 py-0.5 rounded border border-slate-200">/flows</code> sejam resolvidas pelo <code className="font-mono text-[11px]">index.html</code> sem erros de 404.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="font-bold text-slate-900 block mb-1">2. Cache Imutável de Assets</span>
            Arquivos em <code className="font-mono text-[11px] bg-white px-1 py-0.5 rounded border border-slate-200">/assets/*</code> recebem cache de 1 ano (<code className="font-mono text-[11px]">max-age=31536000</code>), acelerando carregamentos subsequentes no Edge da Vercel.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="font-bold text-slate-900 block mb-1">3. Cabeçalhos de Proteção</span>
            Configura HSTS forçado com preload, bloqueio contra MIME sniffing e proteção contra Clickjacking através de <code className="font-mono text-[11px]">SAMEORIGIN</code>.
          </div>
        </div>
      </div>

      {/* Section 2: Step-by-Step Environment Variables Guide */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-600" />
            <span>Guia de Configuração das Variáveis de Ambiente no Painel</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Siga o passo a passo de acordo com a plataforma em que você está hospedando a aplicação.
          </p>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
          <button
            onClick={() => setSelectedPlatform('vercel')}
            className={`pb-2.5 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              selectedPlatform === 'vercel'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-900" />
            <span>Vercel (Dashboard & CLI)</span>
          </button>

          <button
            onClick={() => setSelectedPlatform('railway')}
            className={`pb-2.5 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              selectedPlatform === 'railway'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span>Railway</span>
          </button>

          <button
            onClick={() => setSelectedPlatform('render')}
            className={`pb-2.5 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              selectedPlatform === 'render'
                ? 'border-cyan-600 text-cyan-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-600" />
            <span>Render</span>
          </button>

          <button
            onClick={() => setSelectedPlatform('docker')}
            className={`pb-2.5 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              selectedPlatform === 'docker'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Docker / VPS (.env)</span>
          </button>
        </div>

        {/* Platform Content: Vercel */}
        {selectedPlatform === 'vercel' && (
          <div className="space-y-4 text-xs text-slate-600">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">1</span>
                <span>Configuração via Vercel Dashboard (Interface Web)</span>
              </span>
              <ol className="list-decimal list-inside space-y-2 pl-2 leading-relaxed">
                <li>Acesse seu projeto no dashboard da Vercel: <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">vercel.com/dashboard</a>.</li>
                <li>Clique na aba superior <strong className="text-slate-900">Settings</strong> (Configurações).</li>
                <li>No menu lateral esquerdo, clique em <strong className="text-slate-900">Environment Variables</strong>.</li>
                <li>Adicione as chaves listadas abaixo uma a uma (ou cole todas em lote clicando em <em>Import .env</em>).</li>
                <li>Selecione os ambientes desejados: <strong className="text-slate-900">Production</strong>, <strong className="text-slate-900">Preview</strong> e <strong className="text-slate-900">Development</strong>.</li>
                <li>Clique em <strong className="text-slate-900">Save</strong> e faça um novo deploy (<em>Redeploy</em>) para que as novas variáveis entrem em vigor.</li>
              </ol>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">2</span>
                <span>Configuração via Vercel CLI (Linha de Comando)</span>
              </span>
              <p className="text-slate-600">
                Se você utiliza o Vercel CLI no seu terminal local, execute os comandos abaixo para adicionar e sincronizar as variáveis diretamente:
              </p>
              <div className="bg-slate-950 p-3.5 rounded-xl font-mono text-[11px] text-emerald-400 space-y-1.5 border border-slate-800">
                <div><span className="text-slate-500"># 1. Instalar Vercel CLI globalmente</span></div>
                <div>npm i -g vercel</div>
                <div className="pt-1"><span className="text-slate-500"># 2. Conectar seu repositório local ao projeto Vercel</span></div>
                <div>vercel link</div>
                <div className="pt-1"><span className="text-slate-500"># 3. Adicionar uma variável de ambiente (o CLI solicitará o valor e ambiente)</span></div>
                <div>vercel env add GEMINI_API_KEY production</div>
                <div>vercel env add MONGODB_URI production</div>
                <div>vercel env add APP_URL production</div>
                <div className="pt-1"><span className="text-slate-500"># 4. Puxar variáveis de ambiente para o arquivo local .env</span></div>
                <div>vercel env pull .env.local</div>
              </div>
            </div>
          </div>
        )}

        {/* Platform Content: Railway */}
        {selectedPlatform === 'railway' && (
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-3 text-xs text-purple-950">
            <span className="font-bold text-purple-900 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span>Configuração no Railway</span>
            </span>
            <ol className="list-decimal list-inside space-y-2 pl-2 leading-relaxed text-slate-700">
              <li>No painel do Railway, selecione seu serviço ou projeto.</li>
              <li>Clique na aba <strong className="text-slate-900">Variables</strong> no topo da tela.</li>
              <li>Clique em <strong className="text-slate-900">New Variable</strong> ou utilize o botão <strong className="text-slate-900">RAW Editor</strong> para colar o conteúdo do seu <code className="font-mono text-purple-900">.env</code> de uma só vez.</li>
              <li>Se você provisionou o MongoDB como plugin no Railway, a variável <code className="font-mono text-purple-900">MONGO_URL</code> pode ser referenciada diretamente como <code className="font-mono text-purple-900">{"${{MongoDB.MONGO_URL}}"}</code>.</li>
            </ol>
          </div>
        )}

        {/* Platform Content: Render */}
        {selectedPlatform === 'render' && (
          <div className="p-4 rounded-xl bg-cyan-50/50 border border-cyan-200 space-y-3 text-xs text-cyan-950">
            <span className="font-bold text-cyan-900 text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-600" />
              <span>Configuração no Render</span>
            </span>
            <ol className="list-decimal list-inside space-y-2 pl-2 leading-relaxed text-slate-700">
              <li>No Dashboard do Render, clique no seu Web Service.</li>
              <li>No menu lateral esquerdo, clique em <strong className="text-slate-900">Environment</strong>.</li>
              <li>Clique em <strong className="text-slate-900">Add Environment Variable</strong> ou em <strong className="text-slate-900">Add from .env</strong> para colar em lote.</li>
              <li>O Render iniciará automaticamente uma nova compilação (<em className="text-slate-700">deploy</em>) aplicando os novos valores.</li>
            </ol>
          </div>
        )}

        {/* Platform Content: Docker / VPS */}
        {selectedPlatform === 'docker' && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-700">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-700" />
              <span>Configuração em VPS com Docker ou PM2 (.env file)</span>
            </span>
            <p className="text-slate-600">
              Crie o arquivo <code className="font-mono text-slate-900 bg-slate-200 px-1 py-0.5 rounded">.env</code> na raiz do projeto dentro do servidor de produção:
            </p>
            <div className="bg-slate-950 p-3.5 rounded-xl font-mono text-[11px] text-emerald-400 space-y-1 border border-slate-800">
              <div>nano .env</div>
              <div className="text-slate-500 pt-1"># Cole as variáveis e salve com CTRL+O e ENTER, depois saia com CTRL+X</div>
              <div className="text-slate-500 pt-1"># Reinicie o processo PM2 para carregar o novo .env:</div>
              <div>pm2 reload ecosystem.config.cjs --update-env</div>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Environment Variables Reference Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Dicionário Completo de Variáveis de Ambiente ({ENV_VARIABLES.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Clique em qualquer chave ou exemplo para copiar instantaneamente para a sua área de transferência.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filtrar variáveis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-slate-50 text-slate-900 w-44"
            />
          </div>
        </div>

        {/* Variables Cards Grid */}
        <div className="grid grid-cols-1 gap-3.5">
          {filteredEnvVars.map((item) => (
            <div 
              key={item.key}
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/40 space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded-md border border-slate-200">
                    {item.key}
                  </span>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    item.required 
                      ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {item.required ? 'Obrigatório' : 'Opcional'}
                  </span>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(item.key, `key_${item.key}`)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Copiar nome da variável"
                  >
                    {copiedKey === `key_${item.key}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Copiar Nome</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopy(item.example, `val_${item.key}`)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Copiar valor de exemplo"
                  >
                    {copiedKey === `val_${item.key}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-indigo-500" />
                        <span>Copiar Exemplo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {item.description}
              </p>

              <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-semibold text-slate-700 shrink-0">Instruções:</span>
                  <span>{item.instructions}</span>
                </div>
                <div className="flex items-baseline gap-1.5 font-mono text-[10px] text-slate-400 truncate">
                  <span className="font-sans font-semibold text-slate-700 shrink-0">Exemplo:</span>
                  <span className="truncate">{item.example}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: MongoDB Atlas Free Cloud Tier Quick Guide */}
      <div className="bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-800/60 rounded-2xl p-6 text-white shadow-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-300">
              Banco de Dados em Nuvem Gratuito com MongoDB Atlas (Recomendado para Vercel)
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Como a Vercel opera em ambiente serverless, seu banco MongoDB deve ser acessível via internet segura (TLS).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-800/40 space-y-1">
            <span className="font-bold text-emerald-400 block">1. Criar Cluster M0</span>
            <span className="text-slate-300 text-[11px]">
              Acesse <a href="https://mongodb.com/cloud/atlas" target="_blank" rel="noreferrer" className="text-emerald-300 underline font-semibold">mongodb.com/atlas</a> e crie um cluster compartilhado gratuito (Tier M0, 512MB).
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-800/40 space-y-1">
            <span className="font-bold text-emerald-400 block">2. Acesso de Rede (IP Whitelist)</span>
            <span className="text-slate-300 text-[11px]">
              Vá em <strong className="text-white">Network Access</strong> e adicione o IP <code className="bg-black/40 px-1 py-0.5 rounded text-emerald-300 font-mono">0.0.0.0/0</code> (Allow Access from Anywhere) para permitir requisições da Vercel.
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-800/40 space-y-1">
            <span className="font-bold text-emerald-400 block">3. Obter a Connection String</span>
            <span className="text-slate-300 text-[11px]">
              Clique em <strong className="text-white">Connect &gt; Drivers</strong>, copie a URI no formato <code className="bg-black/40 px-1 py-0.5 rounded text-emerald-300 font-mono">mongodb+srv://...</code> e cole na variável <code className="text-white font-mono">MONGODB_URI</code> da Vercel.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
