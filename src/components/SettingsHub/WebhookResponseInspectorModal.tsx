import React, { useState } from 'react';
import {
  X,
  Check,
  Copy,
  Shield,
  ShieldCheck,
  Zap,
  Activity,
  Code,
  Terminal,
  FileCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
  Layers,
  Key
} from 'lucide-react';

export interface WebhookResponseInspectorData {
  endpointName: string;
  endpointUrl: string;
  statusCode: number;
  success: boolean;
  durationMs: number;
  responseBody: string;
  payloadSent: any;
  requestHeaders: Record<string, string>;
  calculatedHmac?: string;
  hasRealHmac?: boolean;
  secretProvided?: boolean;
  event?: string;
  channel?: string;
  timestamp?: string;
}

interface WebhookResponseInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WebhookResponseInspectorData | null;
}

export const WebhookResponseInspectorModal: React.FC<WebhookResponseInspectorModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [activeTab, setActiveTab] = useState<'response' | 'hmac' | 'payload' | 'headers' | 'guide'>('response');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !data) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isHttpOk = data.statusCode >= 200 && data.statusCode < 300;
  const isClientError = data.statusCode >= 400 && data.statusCode < 500;
  const isServerError = data.statusCode >= 500;

  // Format response body if JSON
  let formattedResponseBody = data.responseBody;
  let isJson = false;
  try {
    const parsed = JSON.parse(data.responseBody);
    formattedResponseBody = JSON.stringify(parsed, null, 2);
    isJson = true;
  } catch {
    // Keep as plain text
  }

  const payloadString = JSON.stringify(data.payloadSent, null, 2);
  const signature = data.calculatedHmac || data.requestHeaders['X-ManyFlow-Signature'] || data.requestHeaders['x-manyflow-signature'] || 'sha256=...';

  // Code snippets for verification
  const nodeJsSnippet = `const crypto = require('crypto');

// Middleware do Express / Node.js
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-manyflow-signature']; // 'sha256=...'
  const secret = process.env.MANYFLOW_WEBHOOK_SECRET;

  if (!signature) {
    return res.status(401).send('Assinatura X-ManyFlow-Signature ausente');
  }

  // Calcula o HMAC SHA-256 sobre o raw body recebido
  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest('hex');
  const expectedSignature = 'sha256=' + expectedHash;

  // Comparação segura contra Timing Attacks
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature, 'utf-8'),
    Buffer.from(expectedSignature, 'utf-8')
  );

  if (!isValid) {
    return res.status(403).send('Assinatura HMAC inválida! Requisição recusada.');
  }

  // Requisição 100% autêntica originada do ManyFlow
  const payload = JSON.parse(req.body.toString());
  console.log('Evento ManyFlow recebido com segurança:', payload.event);

  res.status(200).json({ received: true });
});`;

  const pythonSnippet = `import hmac
import hashlib
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()

@app.post("/api/webhook")
async def receive_manyflow_webhook(request: Request):
    signature = request.headers.get("x-manyflow-signature")
    secret = "SUA_SECRET_KEY_AQUI".encode("utf-8")
    
    if not signature:
        raise HTTPException(status_code=401, detail="Header X-ManyFlow-Signature ausente")
        
    raw_body = await request.body()
    
    # Calcula HMAC SHA-256
    expected_hash = hmac.new(secret, raw_body, hashlib.sha256).hexdigest()
    expected_signature = f"sha256={expected_hash}"
    
    # Comparação segura em tempo constante
    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=403, detail="Assinatura HMAC inválida!")
        
    return {"status": "success", "verified": True}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isHttpOk 
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400' 
                : 'bg-rose-500/20 border-rose-400/40 text-rose-400'
            }`}>
              {isHttpOk ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Resultado do Teste de Conexão:</span>
                  <span className="text-blue-400">{data.endpointName}</span>
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  isHttpOk 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : isClientError 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  HTTP {data.statusCode} {isHttpOk ? 'OK' : isServerError ? 'Server Error' : 'Client Error'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {data.durationMs}ms
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate max-w-xl mt-0.5">
                {data.endpointUrl}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* HMAC Status Notification Strip */}
        <div className={`px-6 py-2.5 border-b text-xs flex items-center justify-between flex-wrap gap-2 ${
          data.hasRealHmac || data.secretProvided
            ? 'bg-blue-50 border-blue-200 text-blue-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 shrink-0 ${data.hasRealHmac || data.secretProvided ? 'text-blue-600' : 'text-amber-600'}`} />
            <span>
              {data.hasRealHmac || data.secretProvided ? (
                <>
                  <strong>Assinatura HMAC SHA-256 Ativa:</strong> A requisição foi assinada com a Secret Key configurada via cabeçalho <code className="font-mono bg-blue-100/80 px-1 py-0.5 rounded text-[11px]">X-ManyFlow-Signature</code>.
                </>
              ) : (
                <>
                  <strong>Modo Padrão:</strong> Nenhuma Secret Key personalizada foi configurada para este endpoint. O ManyFlow usou assinatura padrão de verificação.
                </>
              )}
            </span>
          </div>
          {signature && (
            <div className="flex items-center gap-1.5 font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-blue-200">
              <span className="text-gray-500">HMAC:</span>
              <span className="text-blue-700 font-bold truncate max-w-[200px]">{signature}</span>
              <button
                onClick={() => handleCopy(signature, 'hmac_strip')}
                className="text-gray-400 hover:text-gray-700 cursor-pointer ml-1"
                title="Copiar Hash HMAC"
              >
                {copiedKey === 'hmac_strip' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('response')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'response'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Resposta do Servidor</span>
          </button>

          <button
            onClick={() => setActiveTab('hmac')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'hmac'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Assinatura HMAC SHA-256</span>
          </button>

          <button
            onClick={() => setActiveTab('payload')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'payload'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Payload Enviado (JSON)</span>
          </button>

          <button
            onClick={() => setActiveTab('headers')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'headers'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Headers HTTP Enviados</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Como Validar no Servidor</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
          {/* TAB 1: SERVER RESPONSE */}
          {activeTab === 'response' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">Corpo da Resposta Recebida:</span>
                  <span className="text-[11px] text-gray-500">
                    {isJson ? 'JSON formatado' : 'Texto puro ou HTML'}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(data.responseBody, 'resp_body')}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedKey === 'resp_body' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar Resposta</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
                {formattedResponseBody || '(O servidor respondeu com corpo vazio)'}
              </pre>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="text-[11px] text-gray-500 block">Status HTTP</span>
                  <strong className={`text-sm ${isHttpOk ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {data.statusCode} {isHttpOk ? 'Success' : 'Failed'}
                  </strong>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="text-[11px] text-gray-500 block">Tempo de Resposta (RTT)</span>
                  <strong className="text-sm text-gray-800">{data.durationMs} milissegundos</strong>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="text-[11px] text-gray-500 block">Resultado Geral</span>
                  <strong className={`text-sm ${data.success ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {data.success ? 'Conexão Bem-Sucedida ✅' : 'Falha na Entrega ❌'}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HMAC SIGNATURE DETAILS */}
          {activeTab === 'hmac' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-sm text-blue-950">Assinatura Criptográfica HMAC SHA-256</h4>
                </div>
                <p className="text-xs text-blue-900 leading-relaxed">
                  Para proteger o seu servidor contra ataques de falsificação de requisição (Spoofing) e garantir que os dados de leads e conversões não foram violados em trânsito, o ManyFlow assina o corpo da requisição usando a sua <strong>Secret Key</strong> configurada.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700 text-xs">Cabeçalho Principal de Assinatura:</span>
                    <button
                      onClick={() => handleCopy(`X-ManyFlow-Signature: ${signature}`, 'header_sig')}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'header_sig' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar Cabeçalho</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs bg-white p-2.5 rounded-lg border border-gray-300 break-all text-gray-900">
                    <span className="text-purple-700 font-bold">X-ManyFlow-Signature:</span> {signature}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700 text-xs">Cabeçalho Compatível com Meta/Instagram Webhooks:</span>
                    <button
                      onClick={() => handleCopy(`X-Hub-Signature-256: ${signature}`, 'header_hub')}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'header_hub' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar Cabeçalho</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs bg-white p-2.5 rounded-lg border border-gray-300 break-all text-gray-900">
                    <span className="text-purple-700 font-bold">X-Hub-Signature-256:</span> {signature}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-blue-600" />
                  <span>Fórmula de Verificação:</span>
                </span>
                <p className="font-mono text-[11px] bg-slate-900 text-slate-100 p-2.5 rounded-lg">
                  signature = "sha256=" + HMAC_SHA256(secret_key, raw_request_body_string)
                </p>
                <p className="text-[11px] text-slate-500">
                  Qualquer caractere alterado no payload JSON resultará em um hash completamente diferente, garantindo integridade e confiabilidade criptográfica.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SENT PAYLOAD */}
          {activeTab === 'payload' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">Corpo do Payload JSON Enviado:</span>
                <button
                  onClick={() => handleCopy(payloadString, 'sent_payload')}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedKey === 'sent_payload' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar JSON</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
                {payloadString}
              </pre>
            </div>
          )}

          {/* TAB 4: HTTP HEADERS */}
          {activeTab === 'headers' && (
            <div className="space-y-3">
              <span className="font-bold text-gray-900 block">Cabeçalhos HTTP Enviados pelo ManyFlow:</span>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                      <th className="py-2.5 px-4">Nome do Cabeçalho</th>
                      <th className="py-2.5 px-4">Valor Enviado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                    {Object.entries(data.requestHeaders).map(([k, v]) => (
                      <tr key={k} className="hover:bg-gray-50/70">
                        <td className="py-2 px-4 font-bold text-blue-700">{k}</td>
                        <td className="py-2 px-4 text-gray-800 break-all">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: HOW TO VERIFY CODE GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Como Verificar o HMAC no seu Servidor Externo</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Copie e cole o código correspondente no seu backend para validar a autenticidade das mensagens do ManyFlow.
                  </p>
                </div>
              </div>

              {/* Node.js */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Node.js / Express.js:</span>
                  </span>
                  <button
                    onClick={() => handleCopy(nodeJsSnippet, 'code_nodejs')}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'code_nodejs' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar Código</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                  {nodeJsSnippet}
                </pre>
              </div>

              {/* Python */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-blue-600" />
                    <span>Python / FastAPI / Flask:</span>
                  </span>
                  <button
                    onClick={() => handleCopy(pythonSnippet, 'code_python')}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'code_python' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar Código</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                  {pythonSnippet}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Endpoint: <span className="font-mono font-semibold text-gray-700">{data.endpointName}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Fechar Inspetor
          </button>
        </div>
      </div>
    </div>
  );
};
