import React, { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  RefreshCw,
  Copy,
  Check,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  EyeOff,
  Code,
  FileCode,
  Terminal,
  Server,
  Zap,
  Lock,
  Sparkles,
  Sliders,
  RotateCcw,
  Info,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileJson,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import {
  webhookSignatureService,
  WebhookSignatureConfig,
  VerificationResult,
  SAMPLE_PAYLOADS,
  SignatureSnippet
} from '../../services/webhookSignatureService';
import { externalWebhookService } from '../../services/externalWebhookService';

interface WebhookSignatureToolProps {
  tenantId?: string;
  onSecretApplied?: (newSecret: string) => void;
}

export const WebhookSignatureTool: React.FC<WebhookSignatureToolProps> = ({
  tenantId = 'tenant_main',
  onSecretApplied
}) => {
  const [config, setConfig] = useState<WebhookSignatureConfig>(() =>
    webhookSignatureService.getConfig(tenantId)
  );
  const [showSecret, setShowSecret] = useState(false);
  const [showPreviousSecret, setShowPreviousSecret] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // Secret Generator Settings
  const [selectedFormat, setSelectedFormat] = useState<'whsec' | 'hex' | 'base64' | 'uuid' | 'meta_verify'>(
    config.secretFormat || 'whsec'
  );
  const [byteEntropy, setByteEntropy] = useState<number>(32);

  // Verifier State
  const [testPayloadText, setTestPayloadText] = useState<string>(
    JSON.stringify(SAMPLE_PAYLOADS[0].payload, null, 2)
  );
  const [testSignatureHeader, setTestSignatureHeader] = useState<string>('');
  const [testCustomSecret, setTestCustomSecret] = useState<string>('');
  const [useCustomSecret, setUseCustomSecret] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  // Code Snippets Tab
  const [activeSnippetLang, setActiveSnippetLang] = useState<string>('javascript');
  const [snippets, setSnippets] = useState<SignatureSnippet[]>([]);

  // Apply to endpoints state
  const [isApplyingToEndpoints, setIsApplyingToEndpoints] = useState(false);
  const [appliedSuccessCount, setAppliedSuccessCount] = useState<number | null>(null);

  // Load config on mount or tenant change
  useEffect(() => {
    const currentConfig = webhookSignatureService.getConfig(tenantId);
    setConfig(currentConfig);
    setSelectedFormat(currentConfig.secretFormat);
    setSnippets(webhookSignatureService.generateSnippets(currentConfig));

    // Auto-generate sample signature for default payload
    generateSampleSignatureForInput(currentConfig.activeSecret, currentConfig.algorithm);
  }, [tenantId]);

  const showToast = (msg: string) => {
    setSaveNotification(msg);
    setTimeout(() => setSaveNotification(null), 3500);
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate sample signature for initial input
  const generateSampleSignatureForInput = async (secret: string, algo: 'sha256' | 'sha512') => {
    try {
      const { formattedHeader } = await webhookSignatureService.computeSignatureWebCrypto(
        testPayloadText,
        secret,
        algo
      );
      setTestSignatureHeader(formattedHeader);
    } catch {
      // Ignored
    }
  };

  // Automatically generate a brand new secret
  const handleGenerateSecret = async () => {
    const newSecret = webhookSignatureService.generateSecret(selectedFormat, byteEntropy);
    const updatedConfig: WebhookSignatureConfig = {
      ...config,
      activeSecret: newSecret,
      secretFormat: selectedFormat,
      updatedAt: new Date().toISOString()
    };
    webhookSignatureService.saveConfig(updatedConfig);
    setConfig(updatedConfig);
    setSnippets(webhookSignatureService.generateSnippets(updatedConfig));

    // Update signature test field
    await generateSampleSignatureForInput(newSecret, updatedConfig.algorithm);
    showToast(`✅ Novo Secret gerado com sucesso (${selectedFormat.toUpperCase()} - ${byteEntropy * 8} bits de entropia)!`);

    if (onSecretApplied) {
      onSecretApplied(newSecret);
    }
  };

  // Rotate secret with grace period
  const handleRotateSecret = async () => {
    if (!confirm('Deseja rotacionar a chave secreta de validação? A chave atual será movida para "Chave Anterior (Grace Period)" e continuará sendo aceita temporariamente durante a transição.')) {
      return;
    }
    const updated = webhookSignatureService.rotateSecret(tenantId, selectedFormat);
    setConfig(updated);
    setSnippets(webhookSignatureService.generateSnippets(updated));
    await generateSampleSignatureForInput(updated.activeSecret, updated.algorithm);
    showToast('🔄 Chave rotacionada com sucesso! Grace period de 24h ativado.');

    if (onSecretApplied) {
      onSecretApplied(updated.activeSecret);
    }
  };

  // Update configuration parameters
  const handleSaveConfig = (partial: Partial<WebhookSignatureConfig>) => {
    const updated = { ...config, ...partial };
    webhookSignatureService.saveConfig(updated);
    setConfig(updated);
    setSnippets(webhookSignatureService.generateSnippets(updated));
    showToast('Configurações de assinatura atualizadas.');
  };

  // Run validation
  const handleRunVerification = async () => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const secretToUse = useCustomSecret && testCustomSecret ? testCustomSecret : config.activeSecret;
      const result = await webhookSignatureService.verifySignature({
        payload: testPayloadText,
        receivedHeader: testSignatureHeader,
        secret: secretToUse,
        tenantId,
        algorithm: config.algorithm,
        toleranceSeconds: config.toleranceSeconds
      });

      setVerificationResult(result);
    } catch (err: any) {
      setVerificationResult({
        isValid: false,
        isGenuine: false,
        computedHash: '',
        computedSignature: '',
        receivedSignature: testSignatureHeader,
        extractedHash: '',
        algorithm: config.algorithm,
        headerName: config.headerName,
        usedSecret: 'active',
        latencyMs: 1,
        message: `Erro na verificação: ${err.message}`
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-sign current input with active secret
  const handleSignCurrentPayload = async () => {
    try {
      const secretToUse = useCustomSecret && testCustomSecret ? testCustomSecret : config.activeSecret;
      const { formattedHeader } = await webhookSignatureService.computeSignatureWebCrypto(
        testPayloadText,
        secretToUse,
        config.algorithm
      );
      setTestSignatureHeader(formattedHeader);
      showToast('Assinatura calculada e inserida no campo de cabeçalho.');
    } catch (err: any) {
      alert('Erro ao calcular assinatura: ' + err.message);
    }
  };

  // Tamper payload to demonstrate tampering detection
  const handleTamperPayload = () => {
    try {
      const parsed = JSON.parse(testPayloadText);
      if (parsed.message && parsed.message.text) {
        parsed.message.text += ' [ADULTERADO POR ATACANTE]';
      } else if (parsed.event) {
        parsed.tampered = true;
        parsed.amount_transfer = 999999;
      }
      setTestPayloadText(JSON.stringify(parsed, null, 2));
      showToast('⚠️ Payload intencionalmente adulterado para testar detecção de fraude!');
    } catch {
      setTestPayloadText(testPayloadText + ' ');
    }
  };

  // Load sample payload
  const handleLoadSample = (sample: (typeof SAMPLE_PAYLOADS)[0]) => {
    const jsonStr = JSON.stringify(sample.payload, null, 2);
    setTestPayloadText(jsonStr);
    generateSampleSignatureForInput(config.activeSecret, config.algorithm);
    setVerificationResult(null);
  };

  // Apply active secret to all existing external webhook endpoints
  const handleApplyToAllEndpoints = async () => {
    setIsApplyingToEndpoints(true);
    try {
      const endpoints = await externalWebhookService.getEndpoints(tenantId);
      let count = 0;
      for (const ep of endpoints) {
        if (ep.authType === 'hmac_sha256') {
          ep.hmacSecret = config.activeSecret;
          ep.hmacHeaderName = config.headerName;
          await externalWebhookService.saveEndpoint(ep, tenantId);
          count++;
        }
      }
      setAppliedSuccessCount(count);
      showToast(`Secret aplicado com sucesso a ${count} endpoints HMAC existentes!`);
      setTimeout(() => setAppliedSuccessCount(null), 4000);
    } catch (e) {
      console.error('Error applying secret to endpoints', e);
    } finally {
      setIsApplyingToEndpoints(false);
    }
  };

  return (
    <div id="webhook_signature_tool_container" className="space-y-6">
      {/* Toast Notification */}
      {saveNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1D21] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{saveNotification}</span>
        </div>
      )}

      {/* Main Security Header Card */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl p-6 text-white border border-slate-700/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Validação Criptográfica HMAC
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Timing-Safe & Anti-Replay
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Shield className="w-7 h-7 text-emerald-400" />
              Assinatura & Secret de Validação de Webhooks
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Gere chaves secretas criptograficamente seguras para assinar e validar payloads de webhooks em tempo real.
              Garante que todas as mensagens e eventos recebidos são <strong>100% genuínos</strong> e não foram forjados nem alterados por terceiros.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="btn_generate_new_secret_header"
              onClick={handleGenerateSecret}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 text-emerald-200 animate-pulse" />
              Gerar Secret Automaticamente
            </button>

            <button
              id="btn_rotate_secret_header"
              onClick={handleRotateSecret}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-600/60 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-blue-400" />
              Rotacionar com Grace Period
            </button>
          </div>
        </div>

        {/* Active Secret Display Bar */}
        <div className="mt-6 pt-6 border-t border-slate-700/60 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-slate-900/90 rounded-xl p-3.5 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden w-full">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div className="overflow-hidden w-full">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Secret Ativo Atual</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                    {config.algorithm.toUpperCase()} (256-bit)
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-emerald-300 truncate mt-0.5 select-all">
                  {showSecret ? config.activeSecret : '•'.repeat(Math.min(config.activeSecret.length, 36))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title={showSecret ? 'Ocultar' : 'Revelar'}
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(config.activeSecret, 'activeSecret')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                {copiedKey === 'activeSecret' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'activeSecret' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-700/80 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Header de Validação</div>
              <div className="font-mono text-xs font-bold text-blue-300 truncate">{config.headerName}</div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(config.headerName, 'headerName')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Copiar Nome do Header"
            >
              {copiedKey === 'headerName' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Previous Secret Grace Period Bar (If Available) */}
        {config.previousSecret && (
          <div className="mt-3 p-3 bg-amber-950/40 rounded-xl border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-200">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold">Chave Anterior em Grace Period (24h): </span>
                <span className="font-mono text-amber-300">
                  {showPreviousSecret ? config.previousSecret : '••••••••••••••••••••••••••••••••'}
                </span>
                <span className="text-[10px] text-amber-400/80 ml-2">(Continua válida para evitar falhas durante transições)</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowPreviousSecret(!showPreviousSecret)}
                className="p-1.5 rounded-lg bg-amber-900/50 hover:bg-amber-800/50 text-amber-200 text-xs"
              >
                {showPreviousSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(config.previousSecret || '', 'prevSecret')}
                className="px-2.5 py-1 rounded-lg bg-amber-800/60 hover:bg-amber-700 text-amber-100 text-xs font-semibold flex items-center gap-1"
              >
                {copiedKey === 'prevSecret' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>Copiar</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid: 2 Columns (Tool Config + Live Tester) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Generator Options & Settings */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Secret Generator Config */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1A1D21]">Padrão do Gerador de Secret</h3>
                  <p className="text-xs text-[#64748B]">Formato e algoritmo da chave gerada</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                Web Crypto API
              </span>
            </div>

            {/* Format Selection Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1A1D21] flex items-center justify-between">
                <span>Formato da Chave Criptográfica</span>
                <span className="text-[11px] text-[#64748B]">Alta Entropia (CSPRNG)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'whsec', name: 'whsec_ prefix (Stripe/Shopify)', desc: 'Recomendado (whsec_...)', badge: 'Padrão' },
                  { id: 'hex', name: 'Hexadecimal 64-char', desc: 'SHA-256 Puro', badge: 'Clássico' },
                  { id: 'base64', name: 'Base64 URL-Safe', desc: 'Alta densidade de caracteres', badge: 'Compacto' },
                  { id: 'meta_verify', name: 'Meta / WhatsApp Verify', desc: 'mf_meta_verify_...', badge: 'Meta API' }
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSelectedFormat(fmt.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedFormat === fmt.id
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                        : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#1A1D21]">{fmt.name}</span>
                      {selectedFormat === fmt.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-[#64748B]">{fmt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Entropy Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A1D21] flex items-center justify-between">
                <span>Entropia da Chave (Tamanho)</span>
                <span className="text-xs font-mono font-bold text-blue-600">{byteEntropy * 8} bits ({byteEntropy} bytes)</span>
              </label>
              <div className="flex items-center gap-2">
                {[16, 24, 32, 64].map((bytes) => (
                  <button
                    key={bytes}
                    type="button"
                    onClick={() => setByteEntropy(bytes)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      byteEntropy === bytes
                        ? 'bg-blue-600 text-white border-blue-600 shadow'
                        : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-slate-100'
                    }`}
                  >
                    {bytes * 8} bits
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              id="btn_trigger_generate_secret_body"
              type="button"
              onClick={handleGenerateSecret}
              className="w-full py-3 bg-[#1A1D21] hover:bg-black text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Gerar Novo Secret Automaticamente</span>
            </button>

            {/* Header & Algorithm Settings */}
            <div className="border-t border-[#F1F5F9] pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#64748B] block mb-1">Algoritmo de Hash</label>
                  <select
                    value={config.algorithm}
                    onChange={(e) => handleSaveConfig({ algorithm: e.target.value as any })}
                    className="w-full text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-[#1A1D21] focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sha256">HMAC SHA-256 (Recomendado)</option>
                    <option value="sha512">HMAC SHA-512 (Ultra Seguro)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#64748B] block mb-1">Tolerância Anti-Replay</label>
                  <select
                    value={config.toleranceSeconds}
                    onChange={(e) => handleSaveConfig({ toleranceSeconds: parseInt(e.target.value, 10) })}
                    className="w-full text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-[#1A1D21] focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="60">60 segundos (1 min)</option>
                    <option value="300">300 segundos (5 min)</option>
                    <option value="600">600 segundos (10 min)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#64748B] block mb-1">Nome do Header HTTP</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={config.headerName}
                    onChange={(e) => handleSaveConfig({ headerName: e.target.value })}
                    placeholder="X-Hub-Signature-256"
                    className="flex-1 text-xs font-mono font-bold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-[#1A1D21]"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveConfig({ headerName: 'X-Hub-Signature-256' })}
                    className="px-2.5 py-2 rounded-xl text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Meta Default
                  </button>
                </div>
              </div>
            </div>

            {/* Apply to Endpoints Button */}
            <div className="border-t border-[#F1F5F9] pt-4">
              <button
                type="button"
                onClick={handleApplyToAllEndpoints}
                disabled={isApplyingToEndpoints}
                className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 flex items-center justify-center gap-2 transition-all"
              >
                {isApplyingToEndpoints ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckSquare className="w-3.5 h-3.5" />
                )}
                <span>Aplicar este Secret a Todos os Endpoints HMAC do ManyFlow</span>
              </button>
              {appliedSuccessCount !== null && (
                <p className="text-[11px] text-emerald-600 font-bold text-center mt-1.5">
                  ✅ Atualizado com sucesso em {appliedSuccessCount} endpoints!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Authenticity Verifier & Tester */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1A1D21]">Testador & Validador de Assinatura ao Vivo</h3>
                  <p className="text-xs text-[#64748B]">Audite e valide requisições recebidas contra falsificação</p>
                </div>
              </div>

              {/* Sample Payloads Selector */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mr-1">Exemplo:</span>
                {SAMPLE_PAYLOADS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleLoadSample(s)}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors"
                  >
                    {s.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Input: Signature Header */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1A1D21] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cabeçalho de Assinatura Recebido ({config.headerName})</span>
                </label>
                <button
                  type="button"
                  onClick={handleSignCurrentPayload}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Calcular Assinatura Válida do Payload Atual
                </button>
              </div>
              <input
                type="text"
                value={testSignatureHeader}
                onChange={(e) => setTestSignatureHeader(e.target.value)}
                placeholder="sha256=4f53c8a901248..."
                className="w-full text-xs font-mono font-bold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-[#1A1D21] focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Test Input: Raw JSON Payload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1A1D21] flex items-center gap-1.5">
                  <FileJson className="w-3.5 h-3.5 text-slate-600" />
                  <span>Corpo da Requisição (Raw JSON Body)</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTamperPayload}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    title="Altera o texto do payload para simular um ataque ou dado corrompido"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Simular Adulteração
                  </button>
                </div>
              </div>
              <textarea
                rows={7}
                value={testPayloadText}
                onChange={(e) => {
                  setTestPayloadText(e.target.value);
                  setVerificationResult(null);
                }}
                className="w-full text-xs font-mono bg-[#0F172A] text-emerald-400 p-3.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 transition-all resize-y"
              />
            </div>

            {/* Custom Secret Override Option */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <label className="flex items-center gap-2 font-bold text-[#1A1D21] cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomSecret}
                  onChange={(e) => setUseCustomSecret(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>Testar com Secret Customizado</span>
              </label>

              {useCustomSecret && (
                <input
                  type="text"
                  value={testCustomSecret}
                  onChange={(e) => setTestCustomSecret(e.target.value)}
                  placeholder="Insira outro secret para teste..."
                  className="flex-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-[#1A1D21]"
                />
              )}
            </div>

            {/* Action Verify Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                id="btn_run_signature_verification"
                type="button"
                onClick={handleRunVerification}
                disabled={isVerifying || !testSignatureHeader}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                  !testSignatureHeader
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/20 active:scale-98'
                }`}
              >
                {isVerifying ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-white" />
                )}
                <span>Verificar Autenticidade da Requisição</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSignCurrentPayload();
                  setTimeout(() => handleRunVerification(), 100);
                }}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Auto-Assinar & Validar
              </button>
            </div>

            {/* Result Display Box */}
            {verificationResult && (
              <div
                className={`p-4 rounded-2xl border transition-all animate-in fade-in ${
                  verificationResult.isValid
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/80 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      verificationResult.isValid
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    }`}
                  >
                    {verificationResult.isValid ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1 flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black uppercase tracking-wide flex items-center gap-1.5">
                        {verificationResult.isValid ? 'Requisição 100% Genuína & Autêntica' : 'Assinatura Inválida / Adulteração Detectada'}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                        Latência: {verificationResult.latencyMs}ms
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed font-medium">
                      {verificationResult.message}
                    </p>

                    {/* Technical Comparison Details */}
                    <div className="mt-3 pt-3 border-t border-current/10 space-y-1.5 font-mono text-[11px]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold opacity-75">Hash Calculado:</span>
                        <span className="font-bold truncate select-all">{verificationResult.computedHash || '(vazio)'}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold opacity-75">Hash Recebido:</span>
                        <span className="font-bold truncate select-all">{verificationResult.extractedHash || '(vazio)'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code Snippets Section: How to Validate in Backend */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-black text-[#1A1D21]">Código de Validação para o seu Backend</h3>
            </div>
            <p className="text-xs text-[#64748B]">
              Copie o código pronto para o seu servidor receptor para validar assinaturas com proteção contra Timing Attacks.
            </p>
          </div>

          {/* Language Selector Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {snippets.map((snip) => (
              <button
                key={snip.language}
                type="button"
                onClick={() => setActiveSnippetLang(snip.language)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeSnippetLang === snip.language
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:bg-slate-100'
                }`}
              >
                {snip.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Snippet Display */}
        {snippets
          .filter((s) => s.language === activeSnippetLang)
          .map((snip) => (
            <div key={snip.language} className="relative rounded-2xl bg-[#0F172A] border border-slate-800 overflow-hidden">
              <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-slate-200 font-bold">{snip.filename}</span>
                  <span className="text-[10px] text-slate-500">({snip.title})</span>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(snip.code, `code_${snip.language}`)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  {copiedKey === `code_${snip.language}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === `code_${snip.language}` ? 'Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>

              <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[380px]">
                <code>{snip.code}</code>
              </pre>
            </div>
          ))}
      </div>
    </div>
  );
};
