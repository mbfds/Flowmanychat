export interface WebhookSignatureConfig {
  tenantId: string;
  activeSecret: string;
  previousSecret?: string;
  secretFormat: 'whsec' | 'hex' | 'base64' | 'uuid' | 'meta_verify';
  algorithm: 'sha256' | 'sha512';
  headerName: string;
  headerFormat: 'sha256_prefix' | 'v1_prefix' | 'timestamp_v1' | 'raw_hex';
  toleranceSeconds: number;
  gracePeriodHours: number;
  lastRotatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationResult {
  isValid: boolean;
  isGenuine: boolean;
  computedHash: string;
  computedSignature: string;
  receivedSignature: string;
  extractedHash: string;
  algorithm: string;
  headerName: string;
  usedSecret: 'active' | 'previous' | 'custom' | 'none';
  latencyMs: number;
  message: string;
  timestampCheck?: {
    receivedTimestamp?: number;
    driftSeconds?: number;
    isFresh: boolean;
  };
}

export interface SignatureSnippet {
  language: string;
  title: string;
  icon: string;
  filename: string;
  code: string;
}

const STORAGE_KEY_PREFIX = 'manyflow_webhook_signature_config_';

export const SAMPLE_PAYLOADS: { id: string; label: string; event: string; channel: string; payload: object }[] = [
  {
    id: 'msg_text',
    label: 'Mensagem de Texto (Inbound)',
    event: 'message.received',
    channel: 'instagram',
    payload: {
      event: 'message.received',
      id: 'evt_msg_984123984',
      timestamp: Math.floor(Date.now() / 1000),
      channel: 'instagram',
      sender: {
        id: 'ig_user_8829103948',
        username: 'carolina_silva',
        name: 'Carolina Silva'
      },
      recipient: {
        id: 'page_instagram_oficial',
        name: 'Minha Loja Oficial'
      },
      message: {
        mid: 'm_mid.1740998129384:892348',
        text: 'Olá! Gostaria de saber os valores do plano enterprise.',
        type: 'text'
      }
    }
  },
  {
    id: 'msg_media',
    label: 'Comprovante / Imagem (Mídia)',
    event: 'message.media_received',
    channel: 'whatsapp',
    payload: {
      event: 'message.media_received',
      id: 'evt_media_771928349',
      timestamp: Math.floor(Date.now() / 1000),
      channel: 'whatsapp',
      sender: {
        id: '5511999998888',
        name: 'Rodrigo Lima'
      },
      message: {
        mid: 'wamid.HBgLMjA5ODk4NzY1NA==',
        type: 'image',
        url: 'https://storage.manyflow.io/media/comprovante_pix_882.jpg',
        caption: 'Segue o comprovante do pagamento PIX!'
      }
    }
  },
  {
    id: 'btn_postback',
    label: 'Clique em Botão (Postback)',
    event: 'message.postback',
    channel: 'instagram',
    payload: {
      event: 'message.postback',
      id: 'evt_postback_338912',
      timestamp: Math.floor(Date.now() / 1000),
      channel: 'instagram',
      sender: {
        id: 'ig_user_119283489',
        username: 'lucas_dev'
      },
      postback: {
        title: 'Falar com Atendente Humano',
        payload: 'ACTION_TRANSFER_LIVECHAT_DEPARTMENT_SALES'
      }
    }
  },
  {
    id: 'lead_form',
    label: 'Lead de Anúncio Meta (Lead Ads)',
    event: 'leadgen',
    channel: 'messenger',
    payload: {
      event: 'leadgen',
      id: 'evt_lead_992813',
      timestamp: Math.floor(Date.now() / 1000),
      leadgen_id: 'lead_3948291039482',
      form_id: 'form_blackfriday_2026',
      ad_id: 'ad_4892019482',
      field_data: [
        { name: 'full_name', values: ['Mariana Albuquerque'] },
        { name: 'email', values: ['mariana.albuquerque@gmail.com'] },
        { name: 'phone_number', values: ['+5511988776655'] },
        { name: 'budget', values: ['R$ 5.000 a R$ 15.000'] }
      ]
    }
  }
];

class WebhookSignatureService {
  /**
   * Helper: Convert ArrayBuffer to Hex String
   */
  private bufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Generate a random cryptographic secret string with high entropy
   */
  public generateSecret(format: 'whsec' | 'hex' | 'base64' | 'uuid' | 'meta_verify' = 'whsec', byteLength = 32): string {
    const array = new Uint8Array(byteLength);
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < byteLength; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }

    const hex = Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    switch (format) {
      case 'whsec':
        return `whsec_${hex}`;
      case 'hex':
        return hex;
      case 'base64': {
        const binStr = Array.from(array)
          .map((b) => String.fromCharCode(b))
          .join('');
        return btoa(binStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }
      case 'uuid':
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      case 'meta_verify':
        return `mf_meta_verify_${hex.substring(0, 32)}`;
      default:
        return `whsec_${hex}`;
    }
  }

  /**
   * Get signature configuration for tenant
   */
  public getConfig(tenantId = 'tenant_main'): WebhookSignatureConfig {
    if (typeof window === 'undefined') {
      return this.getDefaultConfig(tenantId);
    }

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${tenantId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read stored webhook signature config', e);
    }

    const defaultConfig = this.getDefaultConfig(tenantId);
    this.saveConfig(defaultConfig);
    return defaultConfig;
  }

  /**
   * Save signature configuration for tenant
   */
  public saveConfig(config: WebhookSignatureConfig): void {
    if (typeof window === 'undefined') return;
    try {
      config.updatedAt = new Date().toISOString();
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${config.tenantId}`, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving signature config', e);
    }
  }

  /**
   * Rotate Secret: Move active to previous (grace period) and generate brand new active secret
   */
  public rotateSecret(
    tenantId = 'tenant_main',
    newFormat?: 'whsec' | 'hex' | 'base64' | 'uuid' | 'meta_verify'
  ): WebhookSignatureConfig {
    const current = this.getConfig(tenantId);
    const format = newFormat || current.secretFormat;
    const newActive = this.generateSecret(format);

    const updated: WebhookSignatureConfig = {
      ...current,
      previousSecret: current.activeSecret,
      activeSecret: newActive,
      secretFormat: format,
      lastRotatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.saveConfig(updated);
    return updated;
  }

  /**
   * Calculate HMAC signature using browser Web Crypto API
   */
  public async computeSignatureWebCrypto(
    payload: string | object,
    secret: string,
    algorithm: 'sha256' | 'sha512' = 'sha256',
    timestamp?: number
  ): Promise<{ hash: string; formattedHeader: string }> {
    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const dataToSign = timestamp ? `${timestamp}.${payloadStr}` : payloadStr;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(dataToSign);

    const subtleAlgo = algorithm === 'sha512' ? 'SHA-512' : 'SHA-256';

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: { name: subtleAlgo } },
      false,
      ['sign']
    );

    const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const hash = this.bufferToHex(signatureBuffer);

    let formattedHeader = `sha256=${hash}`;
    if (algorithm === 'sha512') {
      formattedHeader = `sha512=${hash}`;
    }
    if (timestamp) {
      formattedHeader = `t=${timestamp},v1=${hash}`;
    }

    return { hash, formattedHeader };
  }

  /**
   * Authenticate / Verify incoming webhook signature
   */
  public async verifySignature(params: {
    payload: string | object;
    receivedHeader: string;
    secret?: string;
    tenantId?: string;
    algorithm?: 'sha256' | 'sha512';
    toleranceSeconds?: number;
  }): Promise<VerificationResult> {
    const startTime = performance.now();
    const config = this.getConfig(params.tenantId || 'tenant_main');
    const secretToUse = params.secret || config.activeSecret;
    const algorithm = params.algorithm || config.algorithm || 'sha256';
    const tolerance = params.toleranceSeconds || config.toleranceSeconds || 300;

    const payloadString = typeof params.payload === 'string' ? params.payload : JSON.stringify(params.payload);

    // Try backend verification first
    try {
      const response = await fetch('/api/webhooks/verify-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: payloadString,
          secret: secretToUse,
          signatureHeader: params.receivedHeader,
          algorithm,
          toleranceSeconds: tolerance
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          isValid: data.isValid,
          isGenuine: data.isValid,
          computedHash: data.computedHash || '',
          computedSignature: data.computedSignature || '',
          receivedSignature: params.receivedHeader,
          extractedHash: data.extractedHash || '',
          algorithm: data.algorithm || algorithm,
          headerName: config.headerName,
          usedSecret: params.secret ? 'custom' : 'active',
          latencyMs: Math.round(performance.now() - startTime),
          message: data.message,
          timestampCheck: data.extractedTimestamp
            ? {
                receivedTimestamp: data.extractedTimestamp,
                driftSeconds: data.timestampDriftSeconds,
                isFresh: data.isTimestampValid
              }
            : undefined
        };
      }
    } catch {
      // Fallback to client-side Web Crypto
    }

    // Client-side WebCrypto Fallback
    try {
      let extractedHash = params.receivedHeader.trim();
      let extractedTimestamp: number | undefined = undefined;

      if (params.receivedHeader.includes('t=') && params.receivedHeader.includes('v1=')) {
        const parts = params.receivedHeader.split(',');
        for (const p of parts) {
          const [k, v] = p.split('=').map((s) => s.trim());
          if (k === 't') extractedTimestamp = parseInt(v, 10);
          if (k === 'v1') extractedHash = v;
        }
      } else if (params.receivedHeader.startsWith('sha256=')) {
        extractedHash = params.receivedHeader.substring(7).trim();
      } else if (params.receivedHeader.startsWith('sha512=')) {
        extractedHash = params.receivedHeader.substring(7).trim();
      } else if (params.receivedHeader.startsWith('v1=')) {
        extractedHash = params.receivedHeader.substring(3).trim();
      }

      const { hash: computedHash, formattedHeader: computedSignature } = await this.computeSignatureWebCrypto(
        payloadString,
        secretToUse,
        algorithm,
        extractedTimestamp
      );

      // Check timestamp freshness if present
      let isTimestampValid = true;
      let driftSeconds = 0;
      if (extractedTimestamp) {
        const nowSec = Math.floor(Date.now() / 1000);
        driftSeconds = Math.abs(nowSec - extractedTimestamp);
        if (driftSeconds > tolerance) {
          isTimestampValid = false;
        }
      }

      // Timing-safe style constant comparison
      const isHashMatch = this.timingSafeEqual(computedHash.toLowerCase(), extractedHash.toLowerCase());
      const isValid = isHashMatch && isTimestampValid;

      return {
        isValid,
        isGenuine: isValid,
        computedHash,
        computedSignature,
        receivedSignature: params.receivedHeader,
        extractedHash,
        algorithm,
        headerName: config.headerName,
        usedSecret: params.secret ? 'custom' : 'active',
        latencyMs: Math.round(performance.now() - startTime),
        message: isValid
          ? 'Assinatura válida! A requisição é autêntica e íntegra (genuína).'
          : extractedTimestamp && !isTimestampValid
          ? `Falha: Timestamp expirado (${driftSeconds}s de desvio). Proteção anti-replay ativada.`
          : 'Assinatura inválida! O payload foi adulterado ou o Secret está incorreto.',
        timestampCheck: extractedTimestamp
          ? {
              receivedTimestamp: extractedTimestamp,
              driftSeconds,
              isFresh: isTimestampValid
            }
          : undefined
      };
    } catch (err: any) {
      return {
        isValid: false,
        isGenuine: false,
        computedHash: '',
        computedSignature: '',
        receivedSignature: params.receivedHeader,
        extractedHash: '',
        algorithm,
        headerName: config.headerName,
        usedSecret: 'none',
        latencyMs: Math.round(performance.now() - startTime),
        message: `Erro no processamento da assinatura: ${err.message}`
      };
    }
  }

  /**
   * Constant time string comparison to protect against timing attacks in UI preview
   */
  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  /**
   * Generate code snippets in multiple programming languages
   */
  public generateSnippets(config: WebhookSignatureConfig): SignatureSnippet[] {
    const headerName = config.headerName || 'X-Hub-Signature-256';
    const secret = config.activeSecret;
    const algo = config.algorithm || 'sha256';

    return [
      {
        language: 'javascript',
        title: 'Node.js / Express (Timing-Safe)',
        icon: 'FileCode',
        filename: 'verifyWebhook.js',
        code: `const crypto = require('crypto');

/**
 * Middleware para validação rigorosa de assinatura HMAC SHA-256
 * @param {string} rawBodyString - O corpo da requisição exatamente como recebido (sem JSON.parse prévio)
 * @param {string} signatureHeader - Cabeçalho '${headerName}'
 * @param {string} webhookSecret - Sua chave secreta
 */
function verifyWebhookSignature(rawBodyString, signatureHeader, webhookSecret = process.env.WEBHOOK_SECRET) {
  if (!signatureHeader || !webhookSecret) {
    return false;
  }

  // Extrai o hash caso contenha prefixo (ex: "sha256=abcdef...")
  const receivedHash = signatureHeader.startsWith('sha256=')
    ? signatureHeader.slice(7)
    : signatureHeader;

  // Calcula o HMAC SHA-256 sobre o raw body exato
  const calculatedHash = crypto
    .createHmac('${algo}', webhookSecret)
    .update(rawBodyString, 'utf8')
    .digest('hex');

  // Comparação em tempo constante para evitar Timing Attacks
  try {
    const receivedBuf = Buffer.from(receivedHash, 'hex');
    const calculatedBuf = Buffer.from(calculatedHash, 'hex');
    
    if (receivedBuf.length !== calculatedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(receivedBuf, calculatedBuf);
  } catch (err) {
    return false;
  }
}

// Exemplo de uso no Express com express.raw({ type: 'application/json' })
app.post('/api/webhook/receiver', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['${headerName.toLowerCase()}'];
  const rawBody = req.body.toString('utf8');

  const isGenuine = verifyWebhookSignature(rawBody, signature, "${secret}");

  if (!isGenuine) {
    console.warn('⚠️ [Segurança] Tentativa de webhook rejeitada: Assinatura inválida!');
    return res.status(401).json({ error: 'Assinatura inválida. Acesso não autorizado.' });
  }

  // Parse seguro do JSON após validação da integridade
  const event = JSON.parse(rawBody);
  console.log('✅ Webhook autêntico recebido:', event.event);

  return res.status(200).json({ received: true, verified: true });
});`
      },
      {
        language: 'python',
        title: 'Python (FastAPI / Flask / Django)',
        icon: 'Code',
        filename: 'webhook_verifier.py',
        code: `import hmac
import hashlib
import os

WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "${secret}")

def verify_webhook(raw_body_bytes: bytes, signature_header: str, secret: str = WEBHOOK_SECRET) -> bool:
    """
    Verifica se a assinatura do webhook recebido é genuína e íntegra.
    """
    if not signature_header or not secret:
        return False

    # Remove o prefixo sha256= se existir
    if signature_header.startswith("sha256="):
        expected_hash = signature_header[7:]
    else:
        expected_hash = signature_header

    # Calcula HMAC-${algo.toUpperCase()}
    computed_hash = hmac.new(
        secret.encode('utf-8'),
        msg=raw_body_bytes,
        digestmod=hashlib.${algo}
    ).hexdigest()

    # Comparação segura contra Timing Attacks
    return hmac.compare_digest(computed_hash.lower(), expected_hash.lower())


# --- Exemplo no FastAPI ---
from fastapi import FastAPI, Request, HTTPException, status

app = FastAPI()

@app.post("/webhook")
async def handle_webhook(request: Request):
    raw_body = await request.body()
    signature = request.headers.get("${headerName.toLowerCase()}")

    if not verify_webhook(raw_body, signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Assinatura inválida! Requisição forjada ou não autorizada."
        )

    # Processar evento com segurança
    payload = await request.json()
    return {"status": "success", "event": payload.get("event")}`
      },
      {
        language: 'php',
        title: 'PHP (Laravel / Vanilla)',
        icon: 'Server',
        filename: 'verify_webhook.php',
        code: `<?php

/**
 * Valida a assinatura HMAC de webhooks recebidos
 */
function verifyWebhookSignature(string $rawPayload, string $signatureHeader, string $secret): bool {
    if (empty($signatureHeader) || empty($secret)) {
        return false;
    }

    // Remove prefixo sha256= se presente
    $receivedHash = str_starts_with($signatureHeader, 'sha256=') 
        ? substr($signatureHeader, 7) 
        : $signatureHeader;

    $computedHash = hash_hmac('${algo}', $rawPayload, $secret);

    // hash_equals realiza comparação em tempo constante
    return hash_equals($computedHash, $receivedHash);
}

// Exemplo no PHP nativo
$rawPayload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_${headerName.toUpperCase().replace(/-/g, '_')}'] ?? '';
$secret = '${secret}';

if (!verifyWebhookSignature($rawPayload, $signature, $secret)) {
    http_response_code(401);
    echo json_encode(['error' => 'Assinatura inválida']);
    exit();
}

http_response_code(200);
echo json_encode(['status' => 'success', 'verified' => true]);
?>`
      },
      {
        language: 'go',
        title: 'Go (Golang)',
        icon: 'Terminal',
        filename: 'verifier.go',
        code: `package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"strings"
)

const WebhookSecret = "${secret}"

func verifyWebhook(rawBody []byte, signatureHeader, secret string) bool {
	if signatureHeader == "" || secret == "" {
		return false
	}

	cleanSignature := strings.TrimPrefix(signatureHeader, "sha256=")
	
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(rawBody)
	expectedMAC := hex.EncodeToString(mac.Sum(nil))

	// hmac.Equal garante tempo de execução constante
	return hmac.Equal([]byte(cleanSignature), []byte(expectedMAC))
}

func webhookHandler(w http.ResponseWriter, r *http.Request) {
	signature := r.Header.Get("${headerName}")
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Erro ao ler corpo", http.StatusBadRequest)
		return
	}

	if !verifyWebhook(body, signature, WebhookSecret) {
		http.Error(w, "Assinatura inválida", http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(\`{"verified": true}\`))
}`
      },
      {
        language: 'bash',
        title: 'cURL / Shell Testing',
        icon: 'Terminal',
        filename: 'test_webhook.sh',
        code: `# 1. Define payload e secret
PAYLOAD='{"event":"message.received","id":"test_123","channel":"instagram"}'
SECRET="${secret}"

# 2. Calcula a assinatura HMAC SHA-256 via OpenSSL
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

# 3. Dispara requisição autenticada
curl -X POST https://seu-endpoint.com/webhook \\
  -H "Content-Type: application/json" \\
  -H "${headerName}: sha256=$SIGNATURE" \\
  -d "$PAYLOAD"`
      }
    ];
  }

  private getDefaultConfig(tenantId: string): WebhookSignatureConfig {
    return {
      tenantId,
      activeSecret: 'whsec_' + this.generateSecret('hex', 32),
      previousSecret: undefined,
      secretFormat: 'whsec',
      algorithm: 'sha256',
      headerName: 'X-Hub-Signature-256',
      headerFormat: 'sha256_prefix',
      toleranceSeconds: 300,
      gracePeriodHours: 24,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

export const webhookSignatureService = new WebhookSignatureService();
